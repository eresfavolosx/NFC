
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

const storage = {};

// Mock localStorage
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => storage[k] = v,
  clear: () => { for (const k in storage) delete storage[k]; }
};

// Mock document
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  visibilityState: 'visible'
};

let store;

describe('Store', async () => {
    // Import store once
    const module = await import('../src/store.js');
    store = module.store;

    beforeEach(() => {
        store.reset();
        for (const k in storage) delete storage[k];
    });

    test('should create a link', () => {
        const link = store.createLink({ title: 'Test Link', url: 'http://test.com' });
        assert.strictEqual(store.links.length, 1);
        assert.strictEqual(link.title, 'Test Link');
    });

    test('should update a link', () => {
        const link = store.createLink({ title: 'Test Link', url: 'http://test.com' });
        store.updateLink(link.id, { title: 'Updated Link' });
        const updated = store.getLink(link.id);
        assert.strictEqual(updated.title, 'Updated Link');
    });

    test('should persist data to localStorage', async (t) => {
        store.createLink({ title: 'Persist Link', url: 'http://persist.com' });

        // Wait for debounce (500ms) plus buffer
        await new Promise(resolve => setTimeout(resolve, 600));

        const raw = global.localStorage.getItem('nfc_tag_manager');
        assert.ok(raw, 'Data should be in localStorage');
        const data = JSON.parse(raw);
        assert.strictEqual(data.links.length, 1);
        assert.strictEqual(data.links[0].title, 'Persist Link');
    });
});
