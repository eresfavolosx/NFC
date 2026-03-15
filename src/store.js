/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Data Store (localStorage-backed)
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'nfc_tag_manager';

const defaultData = {
  settings: {
    adminPin: '1234',
    brandName: 'NFC Tag Manager',
    isAuthenticated: false,
  },
  links: [],
  tags: [],
  activity: [],
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

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save store data:', e);
  }
}

// ⚡ Bolt Optimization: Debounce storage writes to avoid blocking main thread
let saveTimeout = null;

function debouncedSave(data) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveData(data);
    saveTimeout = null;
  }, 500);
}

// Flush pending saves when page is hidden to prevent data loss
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && saveTimeout) {
      clearTimeout(saveTimeout);
      saveData(data);
      saveTimeout = null;
    }
  });
}

let data = loadData();
let saveTimeout = null;

function scheduleSave(dataToSave) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveData(dataToSave);
    saveTimeout = null;
  }, 500);
}

// Flush pending saves on visibility change
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
        saveData(data);
      }
    }
  });
}

const listeners = new Set();

export const store = {
  // ── Subscriptions ──
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  _notify() {
    debouncedSave(data);
    listeners.forEach(fn => fn(data));
  },

  // ── Auth ──
  get isAuthenticated() { return data.settings.isAuthenticated; },

  login(pin) {
    if (pin === data.settings.adminPin) {
      data.settings.isAuthenticated = true;
      this._notify();
      return true;
    }
    return false;
  },

  logout() {
    data.settings.isAuthenticated = false;
    this._notify();
  },

  changePin(oldPin, newPin) {
    if (oldPin === data.settings.adminPin) {
      data.settings.adminPin = newPin;
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

  getLink(id) { return data.links.find(l => l.id === id); },

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

  getTag(id) { return data.tags.find(t => t.id === id); },

  createTag({ label, serialNumber = null }) {
    const tag = {
      id: crypto.randomUUID(),
      label,
      serialNumber,
      assignedLinkId: null,
      lastWritten: null,
      createdAt: new Date().toISOString(),
    };
    data.tags.unshift(tag);
    this._addActivity('tag_created', `Registered tag "${label}"`);
    this._notify();
    return tag;
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
    return data.tags.filter(t => t.assignedLinkId === linkId);
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
