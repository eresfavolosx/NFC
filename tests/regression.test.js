import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

const storage = new Map();
const sessionMap = new Map();
const elementsById = new Map();
const revokedUrls = [];

class FakeElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this._innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.selectedIndex = 0;
    this.options = [];
    this.attributes = new Map();
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.listeners = new Map();
    this.classList = {
      _set: new Set(),
      add: (...cls) => cls.forEach(c => this.classList._set.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList._set.delete(c)),
      toggle: (c, force) => {
        if (force === undefined) {
          this.classList._set.has(c) ? this.classList._set.delete(c) : this.classList._set.add(c);
        } else if (force) {
          this.classList._set.add(c);
        } else {
          this.classList._set.delete(c);
        }
      },
      contains: (c) => this.classList._set.has(c),
    };
  }

  set innerHTML(html) {
    this._innerHTML = String(html);
    const idRegex = /<(select|input|button|div|span|code|a|p|h1|h2|h3)\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = idRegex.exec(this._innerHTML)) !== null) {
      const [, tag, id] = match;
      if (!elementsById.has(id)) {
        const el = new FakeElement(tag, id);
        elementsById.set(id, el);
      }
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  setAttribute(k, v) {
    this.attributes.set(k, String(v));
    if (k === 'id') elementsById.set(String(v), this);
  }

  getAttribute(k) {
    return this.attributes.get(k) ?? null;
  }

  appendChild(child) {
    this.children.push(child);
    if (child.id) elementsById.set(child.id, child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
  }

  remove() {
    this.removed = true;
  }

  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners.has(type)) return;
    this.listeners.set(type, this.listeners.get(type).filter(f => f !== fn));
  }

  async click() {
    const fns = this.listeners.get('click') || [];
    for (const fn of fns) {
      await fn({ target: this, currentTarget: this, preventDefault: () => {}, stopPropagation: () => {} });
    }
  }

  querySelector(selector) {
    if (selector.startsWith('#')) return elementsById.get(selector.slice(1)) || null;
    if (selector === '.toast-message') return new FakeElement('span');
    if (selector === '.toast-close') return new FakeElement('button');
    if (selector === '.modal') return null;
    return null;
  }

  querySelectorAll(selector) {
    if (selector === '.assign-btn') {
      const matches = [...this._innerHTML.matchAll(/class="[^"]*assign-btn[^"]*"[^>]*data-tag-id="([^"]*)"/g)];
      return matches.map(m => {
        const btn = new FakeElement('button');
        btn.dataset.tagId = m[1];
        return btn;
      });
    }
    return [];
  }

  focus() {}
}

global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

global.sessionStorage = {
  getItem: (k) => sessionMap.get(k) ?? null,
  setItem: (k, v) => sessionMap.set(k, String(v)),
  removeItem: (k) => sessionMap.delete(k),
  get length() { return sessionMap.size; },
  key: (i) => Array.from(sessionMap.keys())[i] ?? null,
  clear: () => sessionMap.clear()
};

const bodyEl = new FakeElement('body');
bodyEl.contains = () => true;

global.window = {
  location: { origin: 'https://nfc.novu.works', hash: '', href: '' },
  sessionStorage: global.sessionStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  URL: {
    createObjectURL: () => 'blob:https://nfc.novu.works/test-csv',
    revokeObjectURL: (u) => revokedUrls.push(u)
  }
};

global.document = {
  body: bodyEl,
  documentElement: new FakeElement('html'),
  getElementById: (id) => elementsById.get(id) || null,
  createElement: (tag) => new FakeElement(tag),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  visibilityState: 'visible'
};

const { store } = await import('../src/store.js');
const { nfc } = await import('../src/nfc.js');
const { renderAnalytics } = await import('../src/views/analytics.js');
const { renderWriter } = await import('../src/views/writer.js');
const { renderAdmin } = await import('../src/views/admin.js');
const { renderLinks } = await import('../src/views/links.js');
const { renderProfile } = await import('../src/views/profile.js');
const { renderRedirect } = await import('../src/views/redirect.js');

describe('Regression fixes across NFC, Views, XSS, and Redirects', () => {
  let appEl;
  let pageContentEl;

  beforeEach(() => {
    store.reset();
    storage.clear();
    sessionMap.clear();
    elementsById.clear();
    revokedUrls.length = 0;
    global.window.location.hash = '';
    global.window.location.href = '';

    appEl = new FakeElement('div', 'app');
    pageContentEl = new FakeElement('main', 'page-content');
    elementsById.set('app', appEl);
    elementsById.set('page-content', pageContentEl);
  });

  test('nfc._writeTagNative accepts options, awaits addListener before remove, and clears timer', async () => {
    const origDeps = { ...nfc._deps };
    let removed = false;
    let makeReadOnlyCalled = false;
    let stopScanningCalled = false;
    let registeredCallback = null;

    nfc._deps = {
      Capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios' },
      CapacitorNfc: {
        isSupported: async () => ({ supported: true }),
        addListener: async (_eventName, cb) => {
          registeredCallback = cb;
          return { remove: async () => { removed = true; } };
        },
        startScanning: async () => {
          await registeredCallback({ tag: {} });
        },
        write: async () => {},
        makeReadOnly: async () => { makeReadOnlyCalled = true; },
        stopScanning: async () => { stopScanningCalled = true; }
      },
      Haptics: { notification: async () => {} }
    };

    try {
      const res = await nfc._writeTagNative('https://example.com', { lock: true });
      assert.deepStrictEqual(res, { success: true, url: 'https://example.com' });
      assert.strictEqual(removed, true);
      assert.strictEqual(makeReadOnlyCalled, true);
      assert.strictEqual(stopScanningCalled, true);

      const compatMsg = await nfc.getCompatibilityMessage();
      assert.strictEqual(compatMsg, null);
    } finally {
      nfc._deps = origDeps;
    }
  });

  test('analytics.js renders into #page-content, computes 24h scans with Date.parse, and revokes CSV URL', async () => {
    const link = store.createLink({ title: 'Menu <svg onload=alert(1)>', url: 'https://menu.example.com', icon: '<img src=x>' });
    const tag = store.createTag({ label: 'VIP Table' });
    store.incrementClicks(link.id, tag.id);

    renderAnalytics();

    assert.strictEqual(appEl.innerHTML, '', '#app should remain untouched');
    assert.ok(pageContentEl.innerHTML.includes('Analytics'));
    assert.ok(pageContentEl.innerHTML.includes('&lt;img src=x&gt;'), 'l.icon must be escaped');
    assert.ok(!pageContentEl.innerHTML.includes('<img src=x>'), 'raw l.icon must not appear');

    const exportBtn = elementsById.get('exportCsvBtn');
    assert.ok(exportBtn, 'Export CSV button should exist');
    await exportBtn.click();
    assert.deepStrictEqual(revokedUrls, ['blob:https://nfc.novu.works/test-csv']);
  });

  test('writer.js unifies DOM IDs, fixes CSS margin, and persists store assignment only after writeTag succeeds', async () => {
    const link = store.createLink({ title: 'Menu', url: 'https://menu.example.com', icon: '<b>' });
    const tag = store.createTag({ label: 'Tag 1' });
    store.updateSettings({ nfcCompat: { supported: true, platform: 'web' } });

    renderWriter();

    assert.ok(pageContentEl.innerHTML.includes('id="writerLinkSelect"'));
    assert.ok(pageContentEl.innerHTML.includes('id="lockTagToggle"'));
    assert.strictEqual((pageContentEl.innerHTML.match(/id="writerTagSelect"/g) || []).length, 1);
    assert.ok(!pageContentEl.innerHTML.includes('-var(--space-sm)'));
    assert.ok(pageContentEl.innerHTML.includes('calc(var(--space-sm) * -1)'));
    assert.ok(pageContentEl.innerHTML.includes('&lt;b&gt;'));

    elementsById.get('writerLinkSelect').value = link.id;
    elementsById.get('writerTagSelect').value = tag.id;
    elementsById.get('lockTagToggle').checked = false;

    const origWriteTag = nfc.writeTag;
    nfc.writeTag = async () => { throw new Error('Tag moved away & <failed>'); };

    try {
      await elementsById.get('writeBtn').click();
      assert.strictEqual(store.getTag(tag.id).assignedLinkId, null, 'Failed write must not assign link in store');

      nfc.writeTag = async () => ({ success: true });
      await elementsById.get('writeBtn').click();
      assert.strictEqual(store.getTag(tag.id).assignedLinkId, link.id, 'Successful write must assign link in store');
    } finally {
      nfc.writeTag = origWriteTag;
    }
  });

  test('admin.js, links.js, and profile.js escape dynamic fields and avoid Trial ends on null', () => {
    store.updateSettings({
      user: {
        id: 'uid" onclick="alert(1)',
        email: 'fabian.velez1996@gmail.com',
        displayName: '<img onerror=alert(1)>'
      },
      isAuthenticated: true
    });

    const link = store.createLink({ title: 'XSS Link', url: 'https://example.com' });
    link.id = 'id" onclick="alert(1)';
    const tag = store.createTag({
      id: 'tag"<script>',
      label: 'Label<svg>',
      ownerEmail: 'client"<img src=x>@example.com'
    });
    assert.ok(tag);

    renderAdmin();
    assert.ok(!pageContentEl.innerHTML.includes('tag"<script>'));
    assert.ok(pageContentEl.innerHTML.includes('tag&quot;&lt;script&gt;'));

    renderLinks();
    assert.ok(!pageContentEl.innerHTML.includes('data-id="id" onclick="alert(1)"'));
    assert.ok(pageContentEl.innerHTML.includes('id&quot; onclick=&quot;alert(1)'));

    renderProfile();
    assert.ok(!pageContentEl.innerHTML.includes('Trial ends on <strong>null</strong>'));
    assert.ok(!pageContentEl.innerHTML.includes('Trial ends on null'));
    assert.ok(pageContentEl.innerHTML.includes('uid&quot; onclick=&quot;alert(1)'));
    assert.ok(pageContentEl.innerHTML.includes('&lt;'));
  });

  test('redirect.js returns interval cleanup, handles public redirect, and avoids duplicate createTag', () => {
    store.updateSettings({
      user: { id: 'owner-uid', email: 'owner@example.com' },
      isAuthenticated: true
    });
    const link = store.createLink({ title: 'Menu', url: 'https://menu.example.com' });
    const tag = store.createTag({ id: 'pub-tag-1', label: 'Table 5', ownerEmail: 'owner@example.com' });
    store.assignLinkToTag(tag.id, link.id);

    // Owner scenario returns cleanup function
    const cleanup = renderRedirect({ id: tag.id });
    assert.strictEqual(typeof cleanup, 'function');
    cleanup();

    // Public unauthenticated scan reaches public redirect
    store.updateSettings({ user: null, isAuthenticated: false });
    renderRedirect({ id: tag.id });
    assert.strictEqual(global.window.location.href, 'https://menu.example.com');

    // Unclaimed tag activation updates existing tag without creating duplicate
    const unclaimed = store.createTag({ id: 'unclaimed-1', label: 'Unclaimed' });
    store.updateTag(unclaimed.id, { ownerEmail: null, status: 'unclaimed' });
    store.updateSettings({ user: { id: 'claimer-uid', email: 'claimer@example.com' }, isAuthenticated: true });
    const beforeCount = store.tags.length;
    renderRedirect({ id: unclaimed.id });
    elementsById.get('activate-tag-btn').click();
    assert.strictEqual(store.tags.length, beforeCount, 'Activating existing tag must not duplicate it');
    assert.strictEqual(store.getPublicTag(unclaimed.id).ownerEmail, 'claimer@example.com');
  });
});
