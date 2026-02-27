import { test, describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { setTimeout } from 'node:timers/promises';

// Mock localStorage
const localStorageMock = {
  getItem: mock.fn(() => null),
  setItem: mock.fn(),
};
globalThis.localStorage = localStorageMock;

// Mock crypto.randomUUID
if (!globalThis.crypto) {
  globalThis.crypto = {};
}
globalThis.crypto.randomUUID = () => 'test-uuid-' + Math.random();

// Mock document for visibilitychange listener
let visibilityHandler;
globalThis.document = {
  addEventListener: (event, handler) => {
    if (event === 'visibilitychange') {
      visibilityHandler = handler;
    }
  },
  visibilityState: 'visible',
};

describe('Store Persistence Performance', async () => {
  // Dynamic import to ensure mocks are in place
  const { store } = await import('./store.js');

  beforeEach(() => {
    // Reset store state
    store.reset();

    // Ensure any pending debounce is flushed so we start clean
    // This clears the timer set by store.reset()
    globalThis.document.visibilityState = 'hidden';
    if (visibilityHandler) visibilityHandler();
    globalThis.document.visibilityState = 'visible';

    // Clear mock history
    localStorageMock.setItem.mock.resetCalls();
  });

  it('writes to localStorage asynchronously (debounced)', async () => {
    store.createLink({ title: 'Test', url: 'http://test.com' });

    // Should NOT write immediately
    assert.strictEqual(localStorageMock.setItem.mock.callCount(), 0, 'Expected NO immediate write to localStorage');

    // Wait for debounce (500ms + buffer)
    await setTimeout(600);

    // Should have written once
    assert.strictEqual(localStorageMock.setItem.mock.callCount(), 1, 'Expected write to localStorage after debounce');
  });

  it('flushes pending writes on visibility hidden', async () => {
    store.createLink({ title: 'Flush Test', url: 'http://flush.com' });

    assert.strictEqual(localStorageMock.setItem.mock.callCount(), 0);

    // Simulate visibility hidden
    globalThis.document.visibilityState = 'hidden';
    if (visibilityHandler) visibilityHandler();

    // Should write immediately
    assert.strictEqual(localStorageMock.setItem.mock.callCount(), 1, 'Expected immediate flush on visibility hidden');
  });
});
