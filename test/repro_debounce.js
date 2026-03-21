
// Simple mock for localStorage
const storage = new Map();
let setItemCalls = 0;

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => {
      storage.set(key, value);
      setItemCalls++;
    },
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  },
  writable: true,
  configurable: true // Important for re-defining if needed
});

// Mock document for visibilitychange listener
Object.defineProperty(global, 'document', {
    value: {
        addEventListener: () => {},
        visibilityState: 'visible',
    },
    writable: true,
    configurable: true
});

// Use existing crypto if available
if (!global.crypto) {
    global.crypto = {
        randomUUID: () => 'uuid-' + Math.random()
    };
}

async function run() {
  console.log('--- Starting Reproduction ---');
  // Dynamic import to use the mocked globals
  const { store } = await import('../src/store.js');

  setItemCalls = 0;

  // Trigger multiple updates
  console.log('Creating 3 links...');
  store.createLink({ title: 'Link 1', url: 'https://example.com/1' });
  store.createLink({ title: 'Link 2', url: 'https://example.com/2' });
  store.createLink({ title: 'Link 3', url: 'https://example.com/3' });

  console.log('Call count after 3 immediate updates:', setItemCalls);

  // Wait for debounce (assuming 500ms)
  await new Promise(r => setTimeout(r, 600));

  console.log('Call count after delay:', setItemCalls);

  if (setItemCalls > 1) {
      console.log('FAIL: Updates are synchronous (not debounced).');
      process.exit(1);
  } else if (setItemCalls === 0) {
      console.log('FAIL: Updates were never saved.');
      process.exit(1);
  } else {
      console.log('PASS: Updates are debounced (1 call).');
      process.exit(0);
  }
}

run();
