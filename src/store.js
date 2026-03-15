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
    isAuthenticated: false,
  },
  links: [],
  tags: [],
  activity: [],
};

async function hashPin(pin) {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

function persistData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save store data:', e);
  }
}

function debounce(func, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  debounced.flush = (...args) => {
    clearTimeout(timeout);
    func(...args);
  };
  return debounced;
}

const debouncedSaveData = debounce(saveData, 500);

let data = loadData();

// Flush pending saves when the page becomes hidden or is about to unload
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      debouncedSaveData.flush(data);
    }
  });
}

const listeners = new Set();

async function hashPin(pin) {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const store = {
  // ── Subscriptions ──
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  _notify() {
    debouncedSaveData(data);
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
    data.settings.isAuthenticated = false;
    this._notify();
  },

  async changePin(oldPin, newPin) {
    // Check for legacy plain text PIN
    if (data.settings.adminPin.length < 64) {
      if (oldPin === data.settings.adminPin) {
        data.settings.adminPin = await hashPin(newPin);
        this._notify();
        return true;
      }
      return false;
    }

    const hashedOld = await hashPin(oldPin);
    if (hashedOld === data.settings.adminPin) {
      data.settings.adminPin = await hashPin(newPin);
      this._notify();
      return true;
    }

    const hashedNew = await sha256(newPin);
    data.settings.adminPin = hashedNew;
    this._notify();
    return true;
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
