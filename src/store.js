import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';

/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Data Store (localStorage-backed)
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'nfc_tag_manager';

async function hashPin(pin) {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const defaultData = {
  settings: {
    adminPin: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // SHA-256 hash of '1234'
    brandName: 'NFC Tag Manager',
    restaurantMode: false,
    restaurantName: '',
    isAuthenticated: false,
    user: null,
    nfcCompat: { supported: false, platform: 'loading' },
    useBiometrics: false,
    dynamicRedirection: true,
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
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load store data:', e);
  }
  return { ...defaultData };
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

function saveDataDebounced(data) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveData(data);
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
  _cache: null,

  _getCache() {
    if (!this._cache) {
      this._cache = {
        linksById: new Map(),
        tagsById: new Map(),
        tagsByLinkId: new Map()
      };

      for (const link of data.links) {
        this._cache.linksById.set(link.id, link);
      }

      for (const tag of data.tags) {
        this._cache.tagsById.set(tag.id, tag);
        if (tag.assignedLinkId) {
          if (!this._cache.tagsByLinkId.has(tag.assignedLinkId)) {
            this._cache.tagsByLinkId.set(tag.assignedLinkId, []);
          }
          this._cache.tagsByLinkId.get(tag.assignedLinkId).push(tag);
        }
      }
    }
    return this._cache;
  },

  // ── Subscriptions ──
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  _notify() {
    this._cache = null; // Invalidate cache
    saveDataDebounced(data);
    listeners.forEach(fn => fn(data));
  },

  // ── Auth ──
  get isAuthenticated() { return data.settings.isAuthenticated; },

  async login(pin) {
    // Check for legacy plain text PIN (length < 64)
    if (data.settings.adminPin.length < 64) {
      if (pin === data.settings.adminPin) {
        // Migrate to hash immediately
        data.settings.adminPin = await hashPin(pin);
        data.settings.isAuthenticated = true;
        this._notify();
        return true;
      }
      return false;
    }

    // Verify hashed PIN
    const hashedInput = await hashPin(pin);
    if (hashedInput === data.settings.adminPin) {
      data.settings.isAuthenticated = true;
      this._notify();
      return true;
    }

    return false;
  },

  logout() {
    return signOut(auth).then(() => {
        data.settings.isAuthenticated = false;
        data.settings.user = null;
        this._notify();
    });
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

  get user() { return data.settings.user; },
  get nfcCompat() { return data.settings.nfcCompat; },

  async refreshNfcCompat() {
    data.settings.nfcCompat = await nfc.getCompatibilityInfo();
    this._notify();
  },

  async init() {
    await this.refreshNfcCompat();
    this._notify();
  },

  async changePin(oldPin, newPin) {
    const hashedOld = await hashPin(oldPin);
    if (hashedOld === data.settings.adminPin) {
      data.settings.adminPin = await hashPin(newPin);
      this._notify();
      return true;
    }
    return false;
  },

  // ── Settings ──
  get settings() { return { ...data.settings }; },

  updateSettings(updates) {
    data.settings = { ...data.settings, ...updates };
    this._notify();
  },

  // ── Links CRUD ──
  get links() { return [...data.links]; },

  getLink(id) { return this._getCache().linksById.get(id); },

  // ── Subscription Logic ──
  get subscription() { return data.subscription; },

  isPremium() {
    if (data.subscription.tier === 'pro') return true;
    if (data.subscription.trialEndsAt) {
      return new Date(data.subscription.trialEndsAt) > new Date();
    }
    return false;
  },

  startTrial() {
    if (data.subscription.trialStartedAt) return;
    const now = new Date();
    const ends = new Date();
    ends.setDate(now.getDate() + 14); // 14-day trial
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
    const link = {
      id: crypto.randomUUID(),
      title,
      url,
      category,
      icon,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.links.unshift(link);
    this._addActivity('link_created', `Created link "${title}"`);
    this._notify();
    return link;
  },

  updateLink(id, updates) {
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
    // Unassign any tags pointing to this link
    data.tags.forEach(t => {
      if (t.assignedLinkId === id) t.assignedLinkId = null;
    });
    this._addActivity('link_deleted', `Deleted link "${link.title}"`);
    this._notify();
    return true;
  },

  incrementClicks(linkId) {
    const link = data.links.find(l => l.id === linkId);
    if (link) {
      link.clicks++;
      this._notify();
    }
  },

  // ── Tags CRUD ──
  get tags() { return [...data.tags]; },

  getTag(id) { return this._getCache().tagsById.get(id); },

  createTag({ label, serialNumber = null }) {
    if (!this.canCreateTag()) {
        throw new Error('Tag limit reached. Upgrade to Pro for unlimited tags.');
    }
    const tag = {
      id: crypto.randomUUID(),
      label,
      serialNumber,
      assignedLinkId: null,
      lastWritten: null,
      location: null,
      isLocked: false,
      createdAt: new Date().toISOString(),
    };
    data.tags.unshift(tag);
    this._addActivity('tag_created', `Registered tag "${label}"`);
    this._notify();
    return tag;
  },

  createBulkTags(prefix, count, startNum = 1) {
    if (!this.isPremium() && data.tags.length + count > 3) {
        throw new Error('Bulk creation exceeds limit. Upgrade to Pro for more tags.');
    }
    const createdTags = [];
    for (let i = 0; i < count; i++) {
        const num = startNum + i;
        const tag = {
            id: crypto.randomUUID(),
            label: `${prefix} ${num}`,
            serialNumber: null,
            assignedLinkId: null,
            lastWritten: null,
            createdAt: new Date().toISOString(),
        };
        data.tags.unshift(tag);
        createdTags.push(tag);
    }
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
    
    // Generate the URL to be written
    let urlToWrite = link?.url;
    if (data.settings.dynamicRedirection) {
        // Construct a redirection URL pointing back to our app
        // Using window.location.origin as the base
        const base = window.location.origin;
        urlToWrite = `${base}/#/r/${tag.id}`;
    }

    // Capture location if on native
    if (Capacitor.isNativePlatform()) {
        try {
            Geolocation.getCurrentPosition().then(pos => {
                tag.location = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                this._notify();
            });
        } catch (e) {
            console.warn('Geolocation failed:', e);
        }
    }

    this._addActivity('tag_assigned', `Assigned "${link?.title || 'link'}" to tag "${tag.label}"`);
    this._notify();
    return true;
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
    return this._getCache().tagsByLinkId.get(linkId) || [];
  },

  // ── Activity Log ──
  get activity() { return [...data.activity].slice(0, 50); },

  _addActivity(type, message) {
    data.activity.unshift({
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date().toISOString(),
    });
    // Keep only the latest 100
    if (data.activity.length > 100) {
      data.activity = data.activity.slice(0, 100);
    }
  },

  // ── Stats ──
  get stats() {
    return {
      totalLinks: data.links.length,
      totalTags: data.tags.length,
      assignedTags: data.tags.filter(t => t.assignedLinkId).length,
      totalClicks: data.links.reduce((sum, l) => sum + l.clicks, 0),
    };
  },

  // ── Reset ──
  reset() {
    data = { ...defaultData, links: [], tags: [], activity: [] };
    this._notify();
  },
};

// Listen for auth state changes to keep store in sync
onAuthStateChanged(auth, (user) => {
    if (user) {
        data.settings.isAuthenticated = true;
        data.settings.user = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
    } else {
        data.settings.isAuthenticated = false;
        data.settings.user = null;
    }
    store._notify();
});
