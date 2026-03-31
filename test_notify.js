import { store } from './src/store.js';

console.log("Initial state:", store.stats);
console.log("Cached state:", store._cache.stats);
store.createLink({title: "Test", url: "https://test.com", category: "general"});
console.log("State after update:", store._cache.stats);
console.log("New stats:", store.stats);
