/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Tags View
   ═══════════════════════════════════════════════════════════ */

import { store, escapeHTML } from '../store.js';
import { renderHeader } from '../components/header.js';
import { openModal, closeModal, getModalFormData, escapeHTML } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { escapeHTML } from '../utils/sanitize.js';

function formatDate(dateStr) {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

export function renderTags() {
    const container = document.getElementById('page-content');
    const tags = store.tags;
    const links = store.links;

    // ⚡ Bolt Optimization: O(1) link lookup Map for tag rendering
    const linksMap = new Map(links.map(l => [l.id, l]));

    container.innerHTML = `
    ${renderHeader('Tags', 'Manage your NFC bracelet tags')}

    <div class="page-container">
      <div class="links-toolbar">
        <div class="search-bar">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input class="form-input" type="text" id="tagSearch" placeholder="Search tags..." aria-label="Search tags">
        </div>
        <button class="btn btn-primary" id="addTagBtn">
          <span>➕</span> Register Tag
        </button>
      </div>

      ${tags.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🏷️</div>
          <h3 class="empty-state-title">No tags registered</h3>
          <p class="empty-state-desc">Register an NFC tag to start assigning links. You can scan a tag's serial number or add one manually.</p>
          <button class="btn btn-primary" id="emptyAddTag">➕ Register Tag</button>
        </div>
      ` : `
        <div class="tags-list" id="tagsList">
          ${tags.map((tag, i) => renderTagRow(tag, linksMap, i)).join('')}
        </div>
      `}
    </div>
  `;

    initTagsEvents(links);
}

function renderTagRow(tag, linksMap, index) {
    // ⚡ Bolt Optimization: O(1) assigned link lookup
    const assignedLink = tag.assignedLinkId ? (linksMap instanceof Map ? linksMap.get(tag.assignedLinkId) : linksMap.find(l => l.id === tag.assignedLinkId)) : null;

    return `
    <div class="tag-row card animate-fade-up" style="animation-delay: ${0.05 * index}s" data-id="${tag.id}">
      <div class="tag-row-main">
        <div class="tag-icon-wrap">
          <span class="tag-icon-big" aria-hidden="true">🏷️</span>
        </div>
        <div class="tag-info">
          <h3 class="tag-label">${safeLabel}</h3>
          <div class="tag-details">
            ${safeSerial ? `<span class="badge badge-info">SN: ${safeSerial}</span>` : ''}
            ${assignedLink
            ? `<span class="badge badge-success">🔗 ${safeLinkTitle}</span>`
            : `<span class="badge badge-warning">⚠️ No link assigned</span>`
        }
            <span class="tag-date">Last written: ${formatDate(tag.lastWritten)}</span>
          </div>
        </div>
      </div>
      <div class="tag-row-actions">
        <button class="btn btn-secondary assign-link-btn" data-id="${tag.id}">
          ${assignedLink ? '🔄 Reassign' : '🔗 Assign Link'}
        </button>
        <button class="btn btn-ghost btn-icon write-tag-btn" data-id="${tag.id}" title="Write to this tag" aria-label="Write to tag">
          📡
        </button>
        <button class="btn btn-ghost btn-icon delete-tag-btn" data-id="${tag.id}" title="Delete tag" aria-label="Delete tag">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function initTagsEvents(links) {
    // Add tag
    const addBtn = document.getElementById('addTagBtn') || document.getElementById('emptyAddTag');
    addBtn?.addEventListener('click', () => {
        const isSupported = nfc.isSupported();

        openModal({
            title: 'Register New Tag',
            content: `
        <div class="form-group">
          <label class="form-label" for="tagLabel">Tag Name</label>
          <input class="form-input" type="text" id="tagLabel" name="label"
            placeholder="e.g. Blue Bracelet #1" required>
        </div>
          <label class="form-label" for="tagSerial">Serial Number (optional)</label>
          <div style="display: flex; gap: 8px;">
            <input class="form-input" type="text" id="tagSerial" name="serialNumber"
              placeholder="${isSupported ? "Tap 'Scan' to read tag" : "Enter serial number manually (optional)"}" style="flex: 1;">
            ${isSupported ? '<button class="btn btn-secondary" id="scanTagBtn" type="button">Scan</button>' : ''}
          </div>
        </div>
      `,
            submitLabel: 'Register',
            onSubmit: () => {
                const data = getModalFormData();
                if (!data.label) {
                    showToast('Please enter a tag name', 'warning');
                    return;
                }
                store.createTag(data);
                closeModal();
                showToast(`Tag "${escapeHTML(data.label)}" registered!`, 'success');
                renderTags();
            },
        });

        // Attach scan listener if supported
        if (isSupported) {
            const scanBtn = document.getElementById('scanTagBtn');
            scanBtn?.addEventListener('click', async () => {
                const serialInput = document.getElementById('tagSerial');
                if (!serialInput) return;

                scanBtn.disabled = true;
                const originalText = scanBtn.textContent;
                scanBtn.innerHTML = '<span class="spinner"></span> Scanning...';

                try {
                    const result = await nfc.readTag();
                    if (result.serialNumber) {
                        serialInput.value = result.serialNumber;
                        scanBtn.innerHTML = '✅ Scanned';
                        showToast('Tag scanned successfully!', 'success');
                    } else {
                         throw new Error('No serial number found on tag');
                    }
                } catch (err) {
                    scanBtn.innerHTML = originalText;
                    showToast(err.message, 'error');
                } finally {
                    scanBtn.disabled = false;
                     if (scanBtn.textContent !== '✅ Scanned') {
                        scanBtn.innerHTML = originalText;
                    }
                }
            });
        }
    });

    // Assign link
    document.querySelectorAll('.assign-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = store.getTag(btn.dataset.id);
            if (!tag) return;

            if (links.length === 0) {
                showToast('No links available. Create a link first.', 'warning');
                return;
            }

            openModal({
                title: `Assign Link to "${escapeHTML(tag.label)}"`,
                content: `
          <div class="form-group">
            <label class="form-label">Select a link to assign</label>
            <select class="form-select" name="linkId">
              <option value="">— Choose a link —</option>
              ${links.map(l => `
                <option value="${l.id}" ${tag.assignedLinkId === l.id ? 'selected' : ''}>
                  ${escapeHTML(l.title)} — ${escapeHTML(l.url)}
                </option>
              `).join('')}
            </select>
          </div>
        `,
                submitLabel: 'Assign',
                onSubmit: () => {
                    const data = getModalFormData();
                    if (!data.linkId) {
                        showToast('Please select a link', 'warning');
                        return;
                    }
                    store.assignLinkToTag(tag.id, data.linkId);
                    closeModal();
                    showToast(`Link assigned to "${escapeHTML(tag.label)}"\!`, 'success');
                    renderTags();
                },
            });
        });
    });

    // Write tag → navigate to writer
    document.querySelectorAll('.write-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigate('/writer');
        });
    });

    // Delete tag
    document.querySelectorAll('.delete-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = store.getTag(btn.dataset.id);
            if (!tag) return;
            openModal({
                title: 'Delete Tag',
                content: `<p>Are you sure you want to delete <strong>"${escapeHTML(tag.label)}"</strong>?</p>`,
                submitLabel: 'Delete',
                onSubmit: () => {
                    store.deleteTag(tag.id);
                    closeModal();
                    showToast('Tag deleted', 'info');
                    renderTags();
                },
            });
        });
    });

    // Search
    document.getElementById('tagSearch')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        // ⚡ Bolt Optimization: O(1) tag lookup map for search
        const tagsMap = new Map(store.tags.map(t => [t.id, t]));

        document.querySelectorAll('.tag-row').forEach(row => {
            const tag = tagsMap.get(row.dataset.id);
            if (!tag) return;
            const match = tag.label.toLowerCase().includes(q) ||
                (tag.serialNumber && tag.serialNumber.toLowerCase().includes(q));
            row.style.display = match ? '' : 'none';
        });
    });
}
