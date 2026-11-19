import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { translations } from '../src/i18n.js';

const storage = new Map();
const sessionMap = new Map();

// Mock localStorage
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: mock.fn((k, v) => storage.set(k, v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

// Mock window & document
global.window = {
  location: { origin: 'https://nfc.novu.works' },
  addEventListener: mock.fn(),
  removeEventListener: mock.fn(),
  sessionStorage: {
    getItem: (k) => sessionMap.get(k) ?? null,
    setItem: (k, v) => sessionMap.set(k, String(v)),
    removeItem: (k) => sessionMap.delete(k),
    get length() { return sessionMap.size; },
    key: (i) => Array.from(sessionMap.keys())[i] ?? null,
    clear: () => sessionMap.clear()
  }
};

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  visibilityState: 'visible'
};

let store;

describe('Store & Telemetry Engine', async () => {
    const module = await import('../src/store.js');
    store = module.store;

    beforeEach(() => {
        store.reset();
        storage.clear();
        sessionMap.clear();
        global.localStorage.setItem.mock.resetCalls();
    });

    test('should create and update a link with normalized ownerEmail', () => {
        store.updateSettings({ user: { id: 'uid-owner', email: 'Owner@Example.com' }, isAuthenticated: true });
        const link = store.createLink({ title: 'Test Link', url: 'http://test.com' });
        assert.strictEqual(store.links.length, 1);
        assert.strictEqual(link.title, 'Test Link');
        assert.strictEqual(link.ownerEmail, 'owner@example.com');

        store.updateSettings({ user: { id: 'uid-owner', email: 'OWNER@example.com' }, isAuthenticated: true });
        assert.strictEqual(store.links.length, 1);
        assert.ok(store.getLink(link.id));

        store.updateLink(link.id, { title: 'Updated Link' });
        const updated = store.getLink(link.id);
        assert.strictEqual(updated.title, 'Updated Link');
    });

    test('should register tag with custom ID and assign dynamic link without ReferenceError', () => {
        const link = store.createLink({ title: 'Menu', url: 'https://menu.novu.works' });
        const tag = store.createTag({ id: 'custom-tag-01', label: 'Table 1' });
        assert.strictEqual(tag.id, 'custom-tag-01');

        const assignedUrl = store.assignLinkToTag(tag.id, link.id);
        assert.strictEqual(assignedUrl, 'https://nfc.novu.works/#/r/custom-tag-01');
        assert.strictEqual(store.stats.activeTags, 1);
        assert.ok(store.stats.recentActivity[0].description.includes('Table 1'));
    });

    test('should create bulk tags with ownerEmail, location, isLocked, and status', () => {
        store.updateSettings({ user: { id: 'uid-bulk', email: 'Bulk@Example.com' }, isAuthenticated: true });
        const tags = store.createBulkTags('Table', 2, 10);
        assert.strictEqual(tags.length, 2);
        assert.strictEqual(tags[0].label, 'Table 10');
        assert.strictEqual(tags[0].ownerEmail, 'bulk@example.com');
        assert.strictEqual(tags[0].location, null);
        assert.strictEqual(tags[0].isLocked, false);
        assert.strictEqual(tags[0].status, 'active');
    });

    test('should isolate security2FA by user.uid so Account A never locks out Account B', () => {
        const secretA = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
        store.updateSettings({
            user: { id: 'uid-account-a', email: 'a@example.com' },
            isAuthenticated: true
        });
        store.enable2FA(secretA, ['AAAA-1111']);
        assert.strictEqual(store.is2FAEnabled, true);
        assert.strictEqual(store.isSession2FAVerified(), true);

        // Switch to Account B
        store.updateSettings({
            user: { id: 'uid-account-b', email: 'b@example.com' },
            isAuthenticated: true
        });
        assert.strictEqual(store.is2FAEnabled, false);
        assert.strictEqual(store.security2FA, null);
        assert.strictEqual(store.isSession2FAVerified(), false);

        // Switch back to Account A -> Account A retains its 2FA config
        store.updateSettings({
            user: { id: 'uid-account-a', email: 'a@example.com' },
            isAuthenticated: true
        });
        assert.strictEqual(store.is2FAEnabled, true);
        assert.strictEqual(store.security2FA.secret, secretA);
    });

    test('should reset analytics and security2FA cleanly', () => {
        store.updateSettings({ user: { id: 'uid-a', email: 'a@example.com' }, isAuthenticated: true });
        store.enable2FA('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', ['ABCD-1234']);
        store.simulateTap();
        assert.strictEqual(store.analytics.length, 1);

        store.reset();
        assert.strictEqual(store.analytics.length, 0);
        assert.strictEqual(store.is2FAEnabled, false);
        assert.strictEqual(store.user, null);
    });

    test('should neutralize CSV formula injection in exportToCSV()', () => {
        const link = store.createLink({ title: '=CMD("calc")', url: 'https://example.com' });
        const tag = store.createTag({ label: '@SUM(A1)' });
        store.incrementClicks(link.id, tag.id);

        const csv = store.exportToCSV();
        assert.ok(csv.includes('"\'=CMD(""calc"")"'), 'Leading = must be escaped with leading quote');
        assert.ok(csv.includes('"\'@SUM(A1)"'), 'Leading @ must be escaped with leading quote');
    });

    test('should simulate contactless 0.4s NFC tap and increment telemetry', () => {
        const link = store.simulateTap();
        assert.ok(link);
        assert.strictEqual(store.stats.totalClicks, 1);
        assert.strictEqual(store.stats.recentActivity[0].type, 'visit');
    });

    test('should debounce and coalesce rapid updates to localStorage', async () => {
        store.createLink({ title: 'Link 1', url: 'https://one.com' });
        store.createLink({ title: 'Link 2', url: 'https://two.com' });
        store.createLink({ title: 'Link 3', url: 'https://three.com' });

        assert.strictEqual(global.localStorage.setItem.mock.callCount(), 0);
        await new Promise(resolve => setTimeout(resolve, 600));
        assert.strictEqual(global.localStorage.setItem.mock.callCount(), 1);

        const raw = storage.get('nfc_tag_manager');
        assert.ok(raw, 'Data should be in localStorage');
        const data = JSON.parse(raw);
        assert.strictEqual(data.links.length, 3);
    });

    test('should maintain 100% translation key parity between Spanish (es) and English (en)', () => {
        const esKeys = Object.keys(translations.es).sort();
        const enKeys = Object.keys(translations.en).sort();
        assert.deepStrictEqual(esKeys, enKeys);
    });
});
