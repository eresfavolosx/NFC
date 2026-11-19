import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';
import { nfc } from './nfc.js';
import { translations } from './i18n.js';
import { isValidUrl } from './utils/sanitize.js';
import {
    verifyTotpCode,
    verifyAndConsumeBackupCode,
    isSession2FAVerified,
    markSession2FAVerified,
    clearSession2FAVerification
} from './utils/totp.js';

/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Data Store (localStorage-backed)
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'nfc_tag_manager';
const SUPER_ADMIN_EMAIL = 'fabian.velez1996@gmail.com';

const EMPTY_ARRAY = Object.freeze([]);
class TagMap extends Map {
  get(key) {
    return super.get(key) || EMPTY_ARRAY;
  }
}

const defaultData = {
  settings: {
    brandName: 'Tocaito',
    restaurantMode: true,
    restaurantName: '',
    isAuthenticated: false,
    user: null,
    nfcCompat: { supported: false, platform: 'loading' },
    useBiometrics: false,
    dynamicRedirection: true,
    theme: 'system',
    language: 'es', // Default to Spanish
    security2FA: {},
  },
  subscription: {
    tier: 'free', // 'free' or 'pro'
    trialStartedAt: null,
    trialEndsAt: null,
    status: 'active'
  },
  links: [],
  tags: [],
  activity: [],
  analytics: [], // [{ linkId, tagId, timestamp }]
  clients: [],   // [email1, email2, ...] (Explicit client registry)
};

function sanitizeCsvCell(value) {
  const str = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

function loadData() {
  const base = structuredClone(defaultData);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed?.settings || {}) },
        subscription: { ...base.subscription, ...(parsed?.subscription || {}) },
        links: Array.isArray(parsed?.links) ? parsed.links : [],
        tags: Array.isArray(parsed?.tags) ? parsed.tags : [],
        activity: Array.isArray(parsed?.activity) ? parsed.activity : [],
        analytics: Array.isArray(parsed?.analytics) ? parsed.analytics : [],
        clients: Array.isArray(parsed?.clients) ? parsed.clients : [],
      };

      const raw2FA = merged.settings.security2FA;
      if (!raw2FA || typeof raw2FA !== 'object' || Array.isArray(raw2FA)) {
        merged.settings.security2FA = {};
      } else if ('enabled' in raw2FA && 'secret' in raw2FA) {
        // Migrate legacy single-account security2FA object to UID-keyed map
        const uid = merged.settings.user?.id;
        merged.settings.security2FA = uid ? { [uid]: raw2FA } : {};
      }
      return merged;
    }
  } catch (e) {
    console.warn('Failed to load store data:', e);
  }
  return base;
}

function saveData(dataToSave) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save store data:', e);
  }
}

let data = loadData();
const listeners = new Set();
let debounceTimer;
const DEBOUNCE_DELAY = 500;

let authReady = false;
let resolveAuthReady;
const authReadyPromise = new Promise((resolve) => {
  resolveAuthReady = resolve;
});

function saveDataDebounced(dataToSave) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveData(dataToSave);
    debounceTimer = null;
  }, DEBOUNCE_DELAY);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    saveData(data);
  });
}

export const store = {
  _cache: {},

  // ── Subscriptions ──
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  _notify() {
    this._cache = {};
    saveDataDebounced(data);
    listeners.forEach(fn => fn(data));
  },

  // ── Auth ──
  get isAuthenticated() { return !!data.settings.user; },
  get isAuthReady() { return authReady; },

  waitForAuthReady() {
    return authReadyPromise;
  },

  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      data.settings.isAuthenticated = true;
      data.settings.user = {
        id: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
      this._notify();
      return true;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  },

  async logout() {
    const prevUid = data.settings.user?.id || null;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      data.settings.isAuthenticated = false;
      data.settings.user = null;
      clearSession2FAVerification(prevUid);
      this._notify();
    }
  },

  // ── Two-Factor Authentication (2FA, isolated per user.uid) ──
  get security2FA() {
    const uid = data.settings.user?.id;
    if (!uid) return null;
    const map = data.settings.security2FA;
    if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
    return map[uid] || null;
  },

  get is2FAEnabled() {
    const entry = this.security2FA;
    return Boolean(entry?.enabled && entry?.secret);
  },

  enable2FA(secret, backupCodes) {
    const uid = data.settings.user?.id;
    if (!uid) {
      throw new Error('Cannot enable 2FA without an authenticated user.');
    }
    if (!data.settings.security2FA || typeof data.settings.security2FA !== 'object' || Array.isArray(data.settings.security2FA) || 'secret' in data.settings.security2FA) {
      data.settings.security2FA = {};
    }
    data.settings.security2FA[uid] = {
      enabled: true,
      secret,
      backupCodes: Array.isArray(backupCodes) ? [...backupCodes] : [],
      enabledAt: new Date().toISOString()
    };
    markSession2FAVerified(uid);
    this._notify();
  },

  disable2FA() {
    const uid = data.settings.user?.id;
    if (uid && data.settings.security2FA && typeof data.settings.security2FA === 'object') {
      delete data.settings.security2FA[uid];
    }
    clearSession2FAVerification(uid || null);
    this._notify();
  },

  async verify2FACode(code) {
    const entry = this.security2FA;
    if (!entry?.enabled || !entry?.secret) return false;
    return await verifyTotpCode(entry.secret, code);
  },

  verify2FABackupCode(code) {
    const entry = this.security2FA;
    if (!entry?.enabled || !entry?.secret) return false;
    const res = verifyAndConsumeBackupCode(code, entry.backupCodes || []);
    if (res.valid) {
      entry.backupCodes = res.remainingCodes;
      this._notify();
      return true;
    }
    return false;
  },

  isSession2FAVerified() {
    const uid = data.settings.user?.id;
    if (!uid) return false;
    return isSession2FAVerified(uid);
  },

  markSession2FAVerified() {
    const uid = data.settings.user?.id;
    if (!uid) return;
    markSession2FAVerified(uid);
  },

  get user() { return data.settings.user; },
  get nfcCompat() { return data.settings.nfcCompat; },

  async refreshNfcCompat() {
    data.settings.nfcCompat = await nfc.getCompatibilityInfo();
    this._notify();
  },

  isSuperAdmin() {
    return data.settings.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  },

  setLanguage(lang) {
    if (['es', 'en'].includes(lang)) {
      data.settings.language = lang;
      this._notify();
    }
  },

  t(key) {
    const lang = data.settings.language || 'es';
    return translations[lang][key] || key;
  },

  async init() {
    if (data.settings.adminPin) {
      delete data.settings.adminPin;
    }

    try {
      await this.refreshNfcCompat();
    } catch (e) {
      console.error('Store init: failed to refresh nfcCompat', e);
      data.settings.nfcCompat = { supported: false, platform: 'error', message: 'NFC support check failed' };
    }
    this._notify();
  },

  // ── Settings ──
  get settings() { return { ...data.settings }; },

  updateSettings(updates) {
    data.settings = { ...data.settings, ...updates };
    this._notify();
  },

  // ── Cached Lookups ──
  get linksById() {
    if (!this._cache.linksById) {
      this._cache.linksById = new Map(data.links.map(l => [l.id, l]));
    }
    return this._cache.linksById;
  },
  get tagsById() {
    if (!this._cache.tagsById) {
      this._cache.tagsById = new Map(data.tags.map(t => [t.id, t]));
    }
    return this._cache.tagsById;
  },
  get tagsByLinkId() {
    if (!this._cache.tagsByLinkId) {
      const map = new TagMap();
      for (const tag of data.tags) {
        if (tag.assignedLinkId) {
          if (!map.has(tag.assignedLinkId)) map.set(tag.assignedLinkId, []);
          map.get(tag.assignedLinkId).push(tag);
        }
      }
      this._cache.tagsByLinkId = map;
    }
    return this._cache.tagsByLinkId;
  },

  // ── Links CRUD ──
  get links() {
    if (!this._cache.links) {
      if (this.isSuperAdmin()) {
        this._cache.links = [...data.links];
      } else {
        const userEmail = this.user?.email?.toLowerCase();
        this._cache.links = data.links.filter(
          l => l.ownerEmail?.toLowerCase() === userEmail || !l.ownerEmail
        );
      }
    }
    return this._cache.links;
  },

  getLink(id) {
    const link = this.linksById.get(id);
    if (this.isSuperAdmin()) return link || null;
    const userEmail = this.user?.email?.toLowerCase();
    return (link && (link.ownerEmail?.toLowerCase() === userEmail || !link.ownerEmail)) ? link : null;
  },

  getPublicLink(id) {
    return this.linksById.get(id) || null;
  },

  // ── Subscription Logic ──
  get subscription() { return data.subscription; },

  isPremium() {
    return true; // User requested to unlock premium for everyone for now
  },

  startTrial() {
    if (data.subscription.trialStartedAt) return;
    const now = new Date();
    const ends = new Date();
    ends.setDate(now.getDate() + 14);
    data.subscription.trialStartedAt = now.toISOString();
    data.subscription.trialEndsAt = ends.toISOString();
    this._addActivity('trial_started', 'Started 14-day premium trial');
    this._notify();
  },

  upgrade() {
    data.subscription.tier = 'pro';
    this._addActivity('subscription_upgraded', 'Upgraded to Professional plan');
    this._notify();
  },

  canCreateTag() {
    if (this.isPremium()) return true;
    return data.tags.length < 3;
  },

  createLink({ title, url, category = 'general', icon = '🔗' }) {
    if (url && !isValidUrl(url)) {
      throw new Error('Invalid URL protocol. Only http and https are allowed.');
    }
    const link = {
      id: crypto.randomUUID(),
      title,
      url,
      category,
      icon,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerEmail: this.user?.email?.toLowerCase() || null,
    };
    data.links.unshift(link);
    this._addActivity('link_created', `Created link "${title}"`);
    this._notify();
    return link;
  },

  updateLink(id, updates) {
    if (updates.url && !isValidUrl(updates.url)) {
      throw new Error('Invalid URL protocol. Only http and https are allowed.');
    }
    const idx = data.links.findIndex(l => l.id === id);
    if (idx === -1) return null;
    data.links[idx] = {
      ...data.links[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this._addActivity('link_updated', `Updated link "${data.links[idx].title}"`);
    this._notify();
    return data.links[idx];
  },

  deleteLink(id) {
    const link = data.links.find(l => l.id === id);
    if (!link) return false;
    data.links = data.links.filter(l => l.id !== id);
    data.tags.forEach(t => {
      if (t.assignedLinkId === id) t.assignedLinkId = null;
    });
    this._addActivity('link_deleted', `Deleted link "${link.title}"`);
    this._notify();
    return true;
  },

  incrementClicks(linkId, tagId = null) {
    const link = data.links.find(l => l.id === linkId);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      data.analytics.unshift({
        linkId: link.id,
        tagId,
        timestamp: new Date().toISOString(),
      });
      this._notify();
    }
  },

  // ── Tags CRUD ──
  get tags() {
    if (!this._cache.tags) {
      if (this.isSuperAdmin()) {
        this._cache.tags = [...data.tags];
      } else {
        const userEmail = this.user?.email?.toLowerCase();
        this._cache.tags = data.tags.filter(
          t => t.ownerEmail?.toLowerCase() === userEmail || !t.ownerEmail
        );
      }
    }
    return this._cache.tags;
  },

  getTag(id) {
    const tag = this.tagsById.get(id);
    if (this.isSuperAdmin()) return tag || null;
    const userEmail = this.user?.email?.toLowerCase();
    return (tag && (tag.ownerEmail?.toLowerCase() === userEmail || !tag.ownerEmail)) ? tag : null;
  },

  getPublicTag(id) {
    return this.tagsById.get(id) || null;
  },

  createTag({ id = null, label, serialNumber = null, ownerEmail = null }) {
    if (!this.isSuperAdmin() && !this.canCreateTag()) {
      throw new Error('Tag limit reached. Upgrade to Pro for unlimited tags.');
    }
    const normalizedOwner = ownerEmail?.toLowerCase?.().trim() || null;
    const resolvedOwner = normalizedOwner || (this.isSuperAdmin() ? null : (this.user?.email?.toLowerCase() || null));
    const tag = {
      id: id || crypto.randomUUID(),
      label,
      serialNumber,
      assignedLinkId: null,
      lastWritten: new Date().toISOString(),
      location: null,
      isLocked: false,
      createdAt: new Date().toISOString(),
      ownerEmail: resolvedOwner,
      status: normalizedOwner ? 'provisioned' : 'active'
    };
    data.tags.unshift(tag);
    this._addActivity('tag_created', `Registered tag "${label}"`);
    this._notify();
    return tag;
  },

  assignTagToUser(tagId, email) {
    if (!this.isSuperAdmin()) throw new Error('Unauthorized');
    const tag = this.getTag(tagId);
    if (tag) {
      tag.ownerEmail = email.toLowerCase().trim();
      tag.status = 'provisioned';
      this._notify();
      return true;
    }
    return false;
  },

  createBulkTags(prefix, count, startNum = 1, ownerEmail = null) {
    if (!this.isSuperAdmin() && !this.isPremium() && data.tags.length + count > 3) {
      throw new Error('Bulk creation exceeds limit. Upgrade to Pro for more tags.');
    }
    const createdTags = [];
    const nowIso = new Date().toISOString();
    const normalizedOwner = ownerEmail?.toLowerCase?.().trim() || null;
    const resolvedOwner = normalizedOwner || (this.isSuperAdmin() ? null : (this.user?.email?.toLowerCase() || null));
    const status = normalizedOwner ? 'provisioned' : 'active';

    for (let i = 0; i < count; i++) {
      const num = startNum + i;
      const tag = {
        id: crypto.randomUUID(),
        label: `${prefix} ${num}`,
        serialNumber: null,
        assignedLinkId: null,
        lastWritten: null,
        location: null,
        isLocked: false,
        createdAt: nowIso,
        ownerEmail: resolvedOwner,
        status,
      };
      createdTags.push(tag);
    }
    data.tags = createdTags.slice().reverse().concat(data.tags);
    this._addActivity('tag_created', `Registered ${count} bulk tags starting with "${prefix}"`);
    this._notify();
    return createdTags;
  },

  updateTag(id, updates) {
    const idx = data.tags.findIndex(t => t.id === id);
    if (idx === -1) return null;
    data.tags[idx] = { ...data.tags[idx], ...updates };
    this._notify();
    return data.tags[idx];
  },

  assignLinkToTag(tagId, linkId) {
    const tag = data.tags.find(t => t.id === tagId);
    const link = data.links.find(l => l.id === linkId);
    if (!tag) return false;
    tag.assignedLinkId = linkId;
    tag.lastWritten = new Date().toISOString();

    let urlToWrite = link?.url;
    if (data.settings.dynamicRedirection) {
      const base = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://nfc.novu.works';
      urlToWrite = `${base}/#/r/${tag.id}`;
    }

    if (Capacitor.isNativePlatform()) {
      Geolocation.getCurrentPosition()
        .then(pos => {
          tag.location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          this._notify();
        })
        .catch(err => {
          console.warn('Geolocation failed:', err);
        });
    }

    this._addActivity('tag_assigned', `Assigned "${link?.title || 'link'}" to tag "${tag.label}"`);
    this._notify();
    return urlToWrite || true;
  },

  simulateTap() {
    let targetLink = this.links[0];
    if (!targetLink) {
      targetLink = this.createLink({
        title: 'Tocaito Live Showcase',
        url: 'https://nfc.novu.works',
        category: 'general',
        icon: '📡'
      });
    }
    targetLink.clicks = (targetLink.clicks || 0) + 1;
    const targetTag = this.tags[0];
    data.analytics.unshift({
      linkId: targetLink.id,
      tagId: targetTag ? targetTag.id : 'sim-ndef-01',
      timestamp: new Date().toISOString()
    });
    this._addActivity(
      'visit',
      `0.4s NFC Tap → "${targetLink.title}" (${targetTag ? targetTag.label : 'NDEF Token #01'})`
    );
    this._notify();
    return targetLink;
  },

  deleteTag(id) {
    const tag = data.tags.find(t => t.id === id);
    if (!tag) return false;
    data.tags = data.tags.filter(t => t.id !== id);
    this._addActivity('tag_deleted', `Deleted tag "${tag.label}"`);
    this._notify();
    return true;
  },

  // ── Tags assigned to link ──
  getTagsForLink(linkId) {
    return this.tagsByLinkId.get(linkId) || [];
  },

  // ── Analytics ──
  get analytics() { return [...data.analytics]; },

  exportToCSV() {
    const events = this.analytics;
    if (events.length === 0) return '';

    const headers = ['Timestamp', 'Link Title', 'Link URL', 'Tag Label', 'Tag ID'];
    const rows = events.map(event => {
      const link = this.getLink(event.linkId) || this.getPublicLink(event.linkId);
      const tag = event.tagId ? (this.getTag(event.tagId) || this.getPublicTag(event.tagId)) : null;
      return [
        event.timestamp,
        link?.title || 'Unknown',
        link?.url || '',
        tag?.label || 'Direct Link',
        event.tagId || ''
      ].map(sanitizeCsvCell).join(',');
    });

    return [headers.map(sanitizeCsvCell).join(','), ...rows].join('\n');
  },

  // ── Activity Log ──
  get activity() { return [...data.activity].slice(0, 50); },

  _addActivity(type, message) {
    data.activity.unshift({
      id: crypto.randomUUID(),
      type,
      message,
      description: message,
      timestamp: new Date().toISOString(),
    });
    if (data.activity.length > 100) {
      data.activity = data.activity.slice(0, 100);
    }
  },

  // ── Client Discovery ──
  get allClientEmails() {
    if (!this._cache.allClientEmails) {
      const emails = new Set();

      data.clients.forEach(e => emails.add(e.toLowerCase().trim()));
      data.tags.forEach(t => {
        if (t.ownerEmail) emails.add(t.ownerEmail.toLowerCase().trim());
      });
      data.links.forEach(l => {
        if (l.ownerEmail) emails.add(l.ownerEmail.toLowerCase().trim());
      });
      if (data.settings.user?.email) {
        emails.add(data.settings.user.email.toLowerCase().trim());
      }

      this._cache.allClientEmails = Array.from(emails).filter(Boolean).sort();
    }
    return this._cache.allClientEmails;
  },

  // ── Stats ──
  get stats() {
    if (!this._cache.stats) {
      const userTags = this.tags;
      const userLinks = this.links;

      this._cache.stats = {
        totalTags: userTags.length,
        totalLinks: userLinks.length,
        totalClicks: userLinks.reduce((sum, l) => sum + (l.clicks || 0), 0),
        activeTags: userTags.filter(t => t.assignedLinkId).length,
        recentActivity: [...data.activity].slice(0, 10)
      };
    }
    return this._cache.stats;
  },

  // ── Reset ──
  reset() {
    data = structuredClone(defaultData);
    clearSession2FAVerification();
    this._notify();
  },
};

onAuthStateChanged(auth, (user) => {
  const prevUid = data.settings.user?.id || null;
  let changed = false;

  if (user) {
    if (prevUid && prevUid !== user.uid) {
      clearSession2FAVerification(prevUid);
    }
    data.settings.isAuthenticated = true;
    data.settings.user = {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    changed = true;
  } else if (data.settings.user || data.settings.isAuthenticated) {
    data.settings.isAuthenticated = false;
    data.settings.user = null;
    clearSession2FAVerification(prevUid);
    changed = true;
  }

  authReady = true;
  resolveAuthReady(user || null);

  if (changed) {
    store._notify();
  }
});
