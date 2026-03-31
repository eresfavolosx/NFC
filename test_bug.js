import { store } from './src/store.js';
console.log(store.stats.totalLinks);
store.createLink({title: "New", url: "https://new.com", category: "general"});
console.log(store.stats.totalLinks);
