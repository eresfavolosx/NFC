import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { translations } from '../src/i18n.js';

const storage = new Map();

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
  removeEventListener: mock.fn()
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
        global.localStorage.setItem.mock.resetCalls();
    });

    test('should create and update a link', () => {
        const link = store.createLink({ title: 'Test Link', url: 'http://test.com' });
        assert.strictEqual(store.links.length, 1);
        assert.strictEqual(link.title, 'Test Link');

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
