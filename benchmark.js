// Mock localStorage before import
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Use dynamic import after mock
import('./src/store.js').then(({ store }) => {
  store.reset();

  // Directly manipulate store data for benchmark
  const numItems = 10000;
  for (let i = 0; i < numItems; i++) {
    const linkId = i.toString();
    store.createLink({ title: 'Link ' + i, url: 'https://example.com' });
    store.createTag({ label: 'Tag ' + i });
    // Overwrite IDs for reliable matching
    store.links[0].id = linkId;
    store.tags[0].id = 'tag' + i;
    store.tags[0].assignedLinkId = linkId;
  }

  const links = store.links;
  const tags = store.tags;

  console.log(`Testing with ${numItems} links and tags`);

  console.time('O(N*M) Lookup');
  let count1 = 0;
  const assignedTags1 = links.map(link => {
      const ts = tags.filter(t => t.assignedLinkId === link.id);
      count1 += ts.length;
      return ts;
  });
  console.timeEnd('O(N*M) Lookup');

  console.time('O(N+M) Map Lookup');
  const tagsByLinkId = new Map();
  for (const tag of tags) {
      if (tag.assignedLinkId) {
          if (!tagsByLinkId.has(tag.assignedLinkId)) {
              tagsByLinkId.set(tag.assignedLinkId, []);
          }
          tagsByLinkId.get(tag.assignedLinkId).push(tag);
      }
  }
  let count2 = 0;
  const assignedTags2 = links.map(link => {
      const ts = tagsByLinkId.get(link.id) || [];
      count2 += ts.length;
      return ts;
  });
  console.timeEnd('O(N+M) Map Lookup');
});
