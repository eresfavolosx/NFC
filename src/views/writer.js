/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — NFC Writer View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { nfc } from '../nfc.js';
import { renderHeader } from '../components/header.js';
import { escapeHTML } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export function renderWriter() {
  const container = document.getElementById('page-content');
  const links = store.links;
  const tags = store.tags;
  const compatInfo = nfc.getCompatibilityInfo();

  container.innerHTML = `
    ${renderHeader('NFC Writer', 'Program your NFC bracelets')}

    <div class="page-container">
      ${compatInfo.platform === 'ios' ? renderIOSGuide(links) : renderWriterUI(links, tags, compatInfo)}
    </div>
  `;

  if (compatInfo.platform === 'ios') {
    initIOSEvents(links);
  } else {
    initWriterEvents();
  }
}

/* ── iOS-specific Guide ───────────────────────────────── */

function renderIOSGuide(links) {
  return `
    <!-- iOS Reading Info -->
    <div class="ios-hero card animate-fade-up">
      <div class="ios-hero-icon">📱</div>
      <h2>Your iPhone Reads NFC Tags Natively</h2>
      <p class="ios-hero-desc">
        Just tap any programmed NFC tag on the top of your iPhone — it will automatically open the link in Safari. No app needed!
      </p>
      <div class="ios-how-it-works">
        <div class="ios-step">
          <span class="ios-step-num">1</span>
          <span>Wake your iPhone screen</span>
        </div>
        <div class="ios-step">
          <span class="ios-step-num">2</span>
          <span>Hold NFC tag near the top edge</span>
        </div>
        <div class="ios-step">
          <span class="ios-step-num">3</span>
          <span>Tap the notification to open the link</span>
        </div>
      </div>
    </div>

    <!-- Write from Android -->
    <div class="card animate-fade-up" style="animation-delay: 0.1s">
      <div class="card-header">
        <h2 class="card-title">✍️ Writing Tags</h2>
      </div>
      <div class="ios-write-info">
        <p>To <strong>write</strong> a new URL to an NFC tag, you'll need <strong>Chrome on an Android device</strong>. Apple doesn't allow web apps to write to NFC tags.</p>

        <div class="ios-write-options">
          <div class="ios-option">
            <span class="ios-option-icon">🤖</span>
            <div>
              <strong>Option 1: Use an Android phone</strong>
              <p>Open this app in Chrome on any Android device and use the Writer page to program your tags.</p>
            </div>
          </div>
          <div class="ios-option">
            <span class="ios-option-icon">📋</span>
            <div>
              <strong>Option 2: Copy the link & use an NFC app</strong>
              <p>Copy the URL below and use a third-party NFC writer app (like NFC Tools) on your iPhone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Copy -->
    <div class="card animate-fade-up" style="animation-delay: 0.15s">
      <div class="card-header">
        <h2 class="card-title">📋 Quick Copy Link</h2>
      </div>
      <div class="ios-copy-section">
        ${links.length === 0 ? `
          <div class="empty-state" style="padding: var(--space-lg) 0">
            <p class="empty-state-desc">No links available. Create a link first from the Links page.</p>
          </div>
        ` : `
          <select class="form-select" id="iosCopySelect">
            <option value="">— Choose a link —</option>
            ${links.map(l => `<option value="${escapeHTML(l.url)}" data-title="${escapeHTML(l.title)}">${escapeHTML(l.title)} — ${escapeHTML(l.url)}</option>`).join('')}
          </select>
          <div class="ios-copy-preview" id="iosCopyPreview" style="display: none;">
            <code class="ios-copy-url" id="iosCopyUrl"></code>
            <button class="btn btn-primary" id="iosCopyBtn">
              <span>📋</span> Copy URL
            </button>
          </div>
        `}
      </div>
    </div>

    <!-- Compatible Devices -->
    <div class="card animate-fade-up" style="animation-delay: 0.2s">
      <div class="card-header">
        <h2 class="card-title">📖 iPhone NFC Compatibility</h2>
      </div>
      <div class="ios-compat-table">
        <div class="ios-compat-row">
          <span class="ios-compat-device">iPhone 7 – X</span>
          <span class="badge badge-warning">Read via app only</span>
        </div>
        <div class="ios-compat-row">
          <span class="ios-compat-device">iPhone XS / XR and later</span>
          <span class="badge badge-success">✅ Background reading</span>
        </div>
        <div class="ios-compat-row">
          <span class="ios-compat-device">iOS 13+</span>
          <span class="badge badge-info">Required for NDEF</span>
        </div>
      </div>
    </div>
  `;
}

function initIOSEvents(links) {
  const select = document.getElementById('iosCopySelect');
  const preview = document.getElementById('iosCopyPreview');
  const urlEl = document.getElementById('iosCopyUrl');
  const copyBtn = document.getElementById('iosCopyBtn');

  select?.addEventListener('change', () => {
    const url = select.value;
    if (url && preview && urlEl) {
      urlEl.textContent = url;
      preview.style.display = 'flex';
    } else if (preview) {
      preview.style.display = 'none';
    }
  });

  copyBtn?.addEventListener('click', async () => {
    const url = select?.value;
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      copyBtn.innerHTML = '<span>✅</span> Copied!';
      showToast('URL copied to clipboard!', 'success');
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy URL';
      }, 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.innerHTML = '<span>✅</span> Copied!';
      showToast('URL copied to clipboard!', 'success');
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy URL';
      }, 2000);
    }
  });
}

/* ── Standard Writer UI (Android / Desktop) ──────────── */

function renderWriterUI(links, tags, compatInfo) {
  const isSupported = compatInfo.supported;

  return `
      ${!isSupported ? `
        <div class="card nfc-compat-warning animate-fade-up">
          <div class="nfc-compat-icon">⚠️</div>
          <h3>NFC Not Available</h3>
          <p>${compatInfo.message}</p>
          <p class="nfc-compat-note">You can still manage links and tags — just use an Android device with Chrome to write them.</p>
        </div>
      ` : ''}

      <div class="writer-layout">
        <!-- Step 1: Select what to write -->
        <div class="writer-step card animate-fade-up" style="animation-delay: 0.1s">
          <div class="writer-step-header">
            <span class="writer-step-num">1</span>
            <h2>Select a Link</h2>
          </div>

          <div class="writer-link-selector">
            ${links.length === 0 ? `
              <div class="empty-state" style="padding: var(--space-lg) 0">
                <p class="empty-state-desc">No links available. Create a link first from the Links page.</p>
              </div>
            ` : `
              <select class="form-select" id="writerLinkSelect">
                <option value="">— Choose a link to write —</option>
                ${links.map(l => `<option value="${l.id}">${escapeHTML(l.title)} — ${escapeHTML(l.url)}</option>`).join('')}
              </select>
              <div class="writer-link-preview" id="writerLinkPreview" style="display: none;">
                <div class="preview-url" id="previewUrl"></div>
              </div>
            `}
          </div>
        </div>

        <!-- Step 2: Optional tag assignment -->
        <div class="writer-step card animate-fade-up" style="animation-delay: 0.15s">
          <div class="writer-step-header">
            <span class="writer-step-num">2</span>
            <h2>Assign to Tag (Optional)</h2>
          </div>

          <select class="form-select" id="writerTagSelect">
            <option value="">— No specific tag —</option>
            ${tags.map(t => `<option value="${t.id}">${escapeHTML(t.label)}${t.serialNumber ? ` (${escapeHTML(t.serialNumber)})` : ''}</option>`).join('')}
          </select>
        </div>

        <!-- Step 3: Write -->
        <div class="writer-step card animate-fade-up" style="animation-delay: 0.2s">
          <div class="writer-step-header">
            <span class="writer-step-num">3</span>
            <h2>Write to NFC Tag</h2>
          </div>

          <div class="writer-action-area" id="writerActionArea">
            <div class="nfc-tap-target" id="nfcTapTarget">
              <div class="nfc-tap-icon-wrap">
                <div class="nfc-tap-icon">📡</div>
                <div class="nfc-ring"></div>
                <div class="nfc-ring"></div>
                <div class="nfc-ring"></div>
              </div>
              <p class="nfc-tap-label">Tap your NFC tag to write</p>
            </div>

            <button class="btn btn-primary btn-lg" id="writeBtn" ${!isSupported ? 'disabled' : ''}>
              <span>📡</span> Write to Tag
            </button>

            <div class="writer-status" id="writerStatus" style="display: none;"></div>
          </div>
        </div>
      </div>
    `;
}

function initWriterEvents() {
  const linkSelect = document.getElementById('writerLinkSelect');
  const tagSelect = document.getElementById('writerTagSelect');
  const writeBtn = document.getElementById('writeBtn');
  const preview = document.getElementById('writerLinkPreview');
  const previewUrl = document.getElementById('previewUrl');
  const statusEl = document.getElementById('writerStatus');
  const tapTarget = document.getElementById('nfcTapTarget');

  // Link selection preview
  linkSelect?.addEventListener('change', () => {
    const link = store.getLink(linkSelect.value);
    if (link && preview) {
      preview.style.display = 'block';
      previewUrl.textContent = link.url;
    } else if (preview) {
      preview.style.display = 'none';
    }
  });

  // Write button
  writeBtn?.addEventListener('click', async () => {
    const linkId = linkSelect?.value;
    if (!linkId) {
      showToast('Please select a link first', 'warning');
      return;
    }

    const link = store.getLink(linkId);
    if (!link) return;

    // Show writing state
    writeBtn.disabled = true;
    writeBtn.innerHTML = '<span class="spinner"></span> Hold tag near device...';
    tapTarget.classList.add('active');
    statusEl.style.display = 'block';
    statusEl.className = 'writer-status status-writing';
    statusEl.innerHTML = '<span class="spinner"></span> Waiting for NFC tag... Hold the bracelet near your device.';

    try {
      await nfc.writeTag(link.url);

      // Success!
      statusEl.className = 'writer-status status-success';
      statusEl.innerHTML = `
        <span class="status-icon">✅</span>
        <div>
          <strong>Tag written successfully!</strong>
          <p>URL: ${escapeHTML(link.url)}</p>
        </div>
      `;

      // Update tag assignment if selected
      const tagId = tagSelect?.value;
      if (tagId) {
        store.assignLinkToTag(tagId, linkId);
      }

      showToast('NFC tag written successfully!', 'success');
    } catch (err) {
      statusEl.className = 'writer-status status-error';
      statusEl.innerHTML = `
        <span class="status-icon">❌</span>
        <div>
          <strong>Write failed</strong>
          <p>${err.message}</p>
        </div>
      `;
      showToast(err.message, 'error');
    } finally {
      writeBtn.disabled = false;
      writeBtn.innerHTML = '<span>📡</span> Write to Tag';
      tapTarget.classList.remove('active');
    }
  });
}
