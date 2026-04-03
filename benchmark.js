import { store } from './src/store.js';

// populate data
for (let i = 0; i < 10000; i++) {
  store.createLink({ title: 'Link ' + i, url: 'https://example.com/' + i });
  store.createTag({ label: 'Tag ' + i });
}

console.time('links without cache');
for(let i=0; i<100; i++) store.links;
console.timeEnd('links without cache');

console.time('tags without cache');
for(let i=0; i<100; i++) store.tags;
console.timeEnd('tags without cache');

console.time('stats without cache');
for(let i=0; i<100; i++) store.stats;
console.timeEnd('stats without cache');
