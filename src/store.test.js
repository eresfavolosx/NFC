
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key),
  setItem: mock.fn((key, val) => storage.set(key, val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

// Mock window
global.window = {
  addEventListener: mock.fn(),
  removeEventListener: mock.fn()
};

// Import store
const { store } = await import('./store.js');

describe('Store Persistence', () => {
  it('should debounce saveData', async () => {
    // Clear storage and mocks
    storage.clear();
    global.localStorage.setItem.mock.resetCalls();

    // Trigger update
    store.createLink({ title: 'Test 1', url: 'http://test1.com' });

    // Should NOT save immediately
    assert.strictEqual(global.localStorage.setItem.mock.callCount(), 0, 'Should not save immediately');

    // Wait for debounce (500ms) + buffer
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should save once
    assert.strictEqual(global.localStorage.setItem.mock.callCount(), 1, 'Should save after delay');

    // Verify data
    const saved = JSON.parse(storage.get('nfc_tag_manager'));
    assert.strictEqual(saved.links[0].title, 'Test 1');
  });

  it('should coalesce multiple updates', async () => {
    global.localStorage.setItem.mock.resetCalls();

    // Trigger multiple updates rapidly
    store.createLink({ title: 'Test 2', url: 'http://test2.com' });
    store.createLink({ title: 'Test 3', url: 'http://test3.com' });
    store.createLink({ title: 'Test 4', url: 'http://test4.com' });

    assert.strictEqual(global.localStorage.setItem.mock.callCount(), 0, 'Should not save immediately');

    // Wait
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should save only once for the batch
    assert.strictEqual(global.localStorage.setItem.mock.callCount(), 1, 'Should coalesce updates');

    const saved = JSON.parse(storage.get('nfc_tag_manager'));
    // Total links: 1 (from prev test) + 3 (new) = 4
    assert.strictEqual(saved.links.length, 4);
  });

  it('should flush pending save on beforeunload', async () => {
    global.localStorage.setItem.mock.resetCalls();

    // Find the listener
    // Note: window.addEventListener was called on module load.
    // We can inspect the mock calls.
    const calls = global.window.addEventListener.mock.calls;
    const unloadCall = calls.find(c => c.arguments[0] === 'beforeunload');
    assert.ok(unloadCall, 'Should register beforeunload listener');

    const onBeforeUnload = unloadCall.arguments[1];

    // Trigger update
    store.createLink({ title: 'Flush Test', url: 'http://flush.com' });

    assert.strictEqual(global.localStorage.setItem.mock.callCount(), 0);

    // Simulate unload
    onBeforeUnload();

    assert.strictEqual(global.localStorage.setItem.mock.callCount(), 1, 'Should save immediately on unload');

    const saved = JSON.parse(storage.get('nfc_tag_manager'));
    assert.strictEqual(saved.links[0].title, 'Flush Test');
  });
});
