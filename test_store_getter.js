import { store } from './src/store.js';

store.data = { links: [], tags: [], activity: [] }; // Reset
const link = store.createLink({ title: 'Test', url: 'https://example.com' });
console.log('Created link:', link);
console.log('link in cache?', store.linksById.has(link.id));

store.deleteLink(link.id);
console.log('Link deleted?');
console.log('links length:', store.links.length);
