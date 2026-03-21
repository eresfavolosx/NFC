const fs = require('fs');
let content = fs.readFileSync('src/views/tags.js', 'utf8');

content = content.replace(
    "renderHeader('Tags', 'Manage your NFC bracelet tags')",
    "renderHeader('Cards', 'Manage your restaurant\\'s NFC table cards')"
);

content = content.replace('id="tagSearch" placeholder="Search tags..." aria-label="Search tags"', 'id="tagSearch" placeholder="Search cards..." aria-label="Search cards"');
content = content.replace('<span>➕</span> Register Tag', '<span>➕</span> Register Card');
content = content.replace('<div class="empty-state-icon">🏷️</div>', '<div class="empty-state-icon">💳</div>');
content = content.replace('<h3 class="empty-state-title">No tags registered</h3>', '<h3 class="empty-state-title">No cards registered</h3>');
content = content.replace('Register an NFC tag to start assigning links. You can scan a tag\\'s serial number or add one manually.', 'Register an NFC card to start assigning links. You can scan a card\\'s serial number or add one manually.');
content = content.replace('id="emptyAddTag">➕ Register Tag</button>', 'id="emptyAddTag">➕ Register Card</button>');

content = content.replace('<span class="tag-icon-big" aria-hidden="true">🏷️</span>', '<span class="tag-icon-big" aria-hidden="true">💳</span>');

content = content.replace('title="Write to this tag" aria-label="Write to tag ${escapeHTML(tag.label)}"', 'title="Write to this card" aria-label="Write to card ${escapeHTML(tag.label)}"');
content = content.replace('title="Delete tag" aria-label="Delete tag ${escapeHTML(tag.label)}"', 'title="Delete card" aria-label="Delete card ${escapeHTML(tag.label)}"');

content = content.replace("title: 'Register New Tag'", "title: 'Register New Card'");
content = content.replace('<label class="form-label" for="tagLabel">Tag Name</label>', '<label class="form-label" for="tagLabel">Card Name</label>');
content = content.replace('placeholder="e.g. Blue Bracelet #1"', 'placeholder="e.g. Table 1"');

content = content.replace('placeholder="${isSupported ? "Tap \\\'Scan\\\' to read tag" : "Enter serial number manually (optional)"}"', 'placeholder="${isSupported ? "Tap \\\'Scan\\\' to read card" : "Enter serial number manually (optional)"}"');

content = content.replace('showToast(`Tag "${data.label}" registered!`, \\\'success\\\');', 'showToast(`Card "${data.label}" registered!`, \\\'success\\\');');

content = content.replace("showToast('Tag scanned successfully!', 'success');", "showToast('Card scanned successfully!', 'success');");
content = content.replace("throw new Error('No serial number found on tag');", "throw new Error('No serial number found on card');");

content = content.replace("title: 'Delete Tag'", "title: 'Delete Card'");
content = content.replace("showToast('Tag deleted', 'info');", "showToast('Card deleted', 'info');");

fs.writeFileSync('src/views/tags.js', content, 'utf8');
console.log('done tags.js replacement');
