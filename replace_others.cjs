const fs = require('fs');

// links.js
let linksContent = fs.readFileSync('src/views/links.js', 'utf8');

linksContent = linksContent.replace(
    'Create your first link to assign to NFC tags.',
    'Create your first link to assign to NFC cards.'
);

linksContent = linksContent.replace(
    '<span class="badge badge-success">🏷️ ${assignedTagsCount} tag${assignedTagsCount > 1 ? \\\'s\\\' : \\\'\\\'}</span>',
    '<span class="badge badge-success">💳 ${assignedTagsCount} card${assignedTagsCount > 1 ? \\\'s\\\' : \\\'\\\'}</span>'
);

linksContent = linksContent.replace(
    'This will also unassign it from any tags.</p>',
    'This will also unassign it from any cards.</p>'
);

fs.writeFileSync('src/views/links.js', linksContent, 'utf8');

// writer.js
let writerContent = fs.readFileSync('src/views/writer.js', 'utf8');

const replacements = [
    ["renderHeader('NFC Writer', 'Program your NFC bracelets')", "renderHeader('NFC Writer', 'Program your NFC cards')"],
    ["Your iPhone Reads NFC Tags Natively", "Your iPhone Reads NFC Cards Natively"],
    ["Just tap any programmed NFC tag on the top of your iPhone — it will automatically open the link in Safari. No app needed!", "Just tap any programmed NFC card on the top of your iPhone — it will automatically open the link in Safari. Using Cloud Links, you can update the destination URL instantly from the app without ever needing to rewrite the physical card!"],
    ["Hold NFC tag near the top edge", "Hold NFC card near the top edge"],
    ["<h2>✍️ Writing Tags</h2>", "<h2>✍️ Writing Cards</h2>"],
    ["To <strong>write</strong> a new URL to an NFC tag", "To <strong>write</strong> a new URL to an NFC card"],
    ["program your tags.", "program your cards."],
    ["third-party NFC writer app (like NFC Tools) on your iPhone.", "third-party NFC writer app (like NFC Tools) on your iPhone. (Because of Dynamic Redirection, you only have to do this once per card!)"],
    ["manage links and tags — just use an Android device with Chrome to write them.", "manage links and cards — just use an Android device with Chrome to write them."],
    ['<label class="form-label">Lock Tag (Permanent)</label>', '<label class="form-label">Lock Card (Permanent)</label>'],
    ['<label class="form-label" style="margin-bottom:0">Lock Tag (Read-Only)</label>', '<label class="form-label" style="margin-bottom:0">Lock Card (Read-Only)</label>'],
    ["Once locked, the tag cannot be erased or rewritten.", "Once locked, the card cannot be erased or rewritten."],
    ['<label class="form-label">Assign to Registered Tag (Optional)</label>', '<label class="form-label">Assign to Registered Card (Optional)</label>'],
    ['aria-label="Select a registered tag"', 'aria-label="Select a registered card"'],
    ['<option value="">— Select a tag —</option>', '<option value="">— Select a card —</option>'],
    ["<strong>Sequential Mode</strong> (Auto-advance to next tag after writing)", "<strong>Sequential Mode</strong> (Auto-advance to next card after writing)"],
    ["<h2>Assign to Tag (Optional)</h2>", "<h2>Assign to Card (Optional)</h2>"],
    ['aria-label="Assign to a tag"', 'aria-label="Assign to a card"'],
    ['<option value="">— No specific tag —</option>', '<option value="">— No specific card —</option>'],
    ["<h2>Write to NFC Tag</h2>", "<h2>Write to NFC Card</h2>"],
    ['<p class="nfc-tap-label">Tap your NFC tag to write</p>', '<p class="nfc-tap-label">Tap your NFC card to write</p>'],
    ["<span>📡</span> Write to Tag", "<span>📡</span> Write to Card"],
    ["Write to Tag", "Write to Card"],
    ["Hold tag near device...", "Hold card near device..."],
    ["Waiting for NFC tag... Hold the bracelet near your device.", "Waiting for NFC card... Hold the card near your device."],
    ["${escapeHTML(tag?.label || 'tag')}", "${escapeHTML(tag?.label || 'card')}"],
    ["Failed to update tag in database", "Failed to update card in database"],
    ["<strong>Tag written successfully!</strong>", "<strong>Card written successfully!</strong>"],
    ["Next Tag", "Next Card"],
    ["All tags in list programmed!", "All cards in list programmed!"],
    ["NFC tag written successfully!", "NFC card written successfully!"]
];

replacements.forEach(([search, replace]) => {
    writerContent = writerContent.replace(search, replace);
});

fs.writeFileSync('src/views/writer.js', writerContent, 'utf8');
console.log('done all replacements');
