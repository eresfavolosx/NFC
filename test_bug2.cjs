const fs = require('fs');
const content = fs.readFileSync('src/store.js', 'utf8');

// The reviewer says "_notify() does not implement invalidation".
// Let's print out what `_notify()` looks like in the final state.
console.log(content.match(/_notify\(\) {[\s\S]*?},/)[0]);
