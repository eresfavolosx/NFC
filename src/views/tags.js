/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Tags View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader } from '../components/header.js';
import { openModal, closeModal, getModalFormData } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { escapeHTML } from '../utils/sanitize.js';
import { nfc } from '../nfc.js';

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
    const t = (k) => store.t(k);

    container.innerHTML = `
    ${renderHeader(t('tags'), t('manage_tags'))}

    <div class="page-container">
      <div class="links-toolbar">
        <div class="search-bar">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input class="form-input" type="text" id="tagSearch" placeholder="${t('search_tags')}" aria-label="${t('search_tags')}">
        </div>
        <button class="btn btn-primary" id="addTagBtn">
          <span aria-hidden="true">➕</span> ${t('register_tag')}
        </button>
      </div>

      ${tags.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">🏷️</div>
          <h3 class="empty-state-title">${t('no_tags')}</h3>
          <p class="empty-state-desc">${t('no_tags_desc')}</p>
          <button class="btn btn-primary" id="emptyAddTag"><span aria-hidden="true">➕</span> ${t('register_tag')}</button>
        </div>
      ` : `
        <div class="tags-list" id="tagsList">
          ${tags.map((tag, i) => renderTagRow(tag, i, t)).join('')}
        </div>
      `}
    </div>
  `;

    initTagsEvents(links);
}

function renderTagRow(tag, index, t) {
    const assignedLink = tag.assignedLinkId ? store.getLink(tag.assignedLinkId) : null;
    const searchString = escapeHTML((tag.label + ' ' + (tag.serialNumber || '')).toLowerCase());

    return `
    <div class="tag-row card animate-fade-up" style="animation-delay: ${0.05 * index}s" data-id="${tag.id}" data-search="${searchString}">
      <div class="tag-row-main">
        <div class="tag-icon-wrap">
          <span class="tag-icon-big" aria-hidden="true">🏷️</span>
        </div>
        <div class="tag-info">
          <h3 class="tag-label">${escapeHTML(tag.label)}</h3>
          <div class="tag-details">
            ${tag.serialNumber ? `<span class="badge badge-info">${t('sn')}: ${escapeHTML(tag.serialNumber)}</span>` : ''}
            ${assignedLink
            ? `<span class="badge badge-success">🔗 ${escapeHTML(assignedLink.title)}</span>`
            : `<span class="badge badge-warning">⚠️ ${t('no_link_assigned')}</span>`
        }
            <div class="tag-meta">
              ${tag.isLocked ? `<span class="tag-badge status-locked">🔒 ${t('locked')}</span>` : ''}
              ${tag.location ? `<span class="tag-badge location-badge" title="${tag.location.lat}, ${tag.location.lng}">📍 ${t('geo_tagged')}</span>` : ''}
              <span class="tag-date">Added ${new Date(tag.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tag-row-actions">
        <button class="btn btn-secondary assign-link-btn" data-id="${tag.id}">
          ${assignedLink ? `🔄 ${t('reassign')}` : `🔗 ${t('assign_link')}`}
        </button>
        <button class="btn btn-ghost btn-icon write-tag-btn" data-id="${tag.id}" title="Write to this tag" aria-label="Write to tag ${escapeHTML(tag.label)}">
          📡
        </button>
        <button class="btn btn-ghost btn-icon delete-tag-btn" data-id="${tag.id}" title="Delete tag" aria-label="Delete tag ${escapeHTML(tag.label)}">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function initTagsEvents(links) {
    const t = (k) => store.t(k);
    const openRegisterModal = () => {
        const isSupported = nfc.isSupported();

        openModal({
            title: t('register_tag'),
            content: `
        <div class="form-group">
          <label class="form-label" for="tagLabel">Tag Name <span aria-hidden="true" style="color: var(--color-error);">*</span></label>
          <input class="form-input" type="text" id="tagLabel" name="label"
            placeholder="e.g. Blue Bracelet #1" required>
        </div>
        <div class="form-group">
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
                showToast(`Tag "${data.label}" registered!`, 'success');
                renderTags();
            },
        });

        if (isSupported) {
            document.getElementById('scanTagBtn')?.addEventListener('click', async (e) => {
                const scanBtn = e.target;
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
                }
            });
        }
    };

    document.getElementById('addTagBtn')?.addEventListener('click', openRegisterModal);
    document.getElementById('emptyAddTag')?.addEventListener('click', openRegisterModal);

    // event delegation for tag row actions
    document.getElementById('tagsList')?.addEventListener('click', (e) => {
        const assignBtn = e.target.closest('.assign-link-btn');
        if (assignBtn) {
            const tag = store.getTag(assignBtn.dataset.id);
            if (!tag) return;

            if (links.length === 0) {
                showToast('No links available. Create a link first.', 'warning');
                return;
            }

            openModal({
                title: `${t('assign_link')} to "${tag.label}"`,
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
                    showToast(`Link assigned to "${tag.label}"`, 'success');
                    renderTags();
                },
            });
            return;
        }

        const writeBtn = e.target.closest('.write-tag-btn');
        if (writeBtn) {
            navigate('/writer');
            return;
        }

        const deleteBtn = e.target.closest('.delete-tag-btn');
        if (deleteBtn) {
            const tag = store.getTag(deleteBtn.dataset.id);
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
            return;
        }
    });

    // Debounce search input to minimize expensive DOM manipulations on keystroke
    let searchTimeout;
    document.getElementById('tagSearch')?.addEventListener('input', (e) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.tag-row').forEach(row => {
                const match = !q || row.dataset.search.includes(q);
                row.style.display = match ? '' : 'none';
            });
        }, 300);
    });
}
