/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Links View
   ═══════════════════════════════════════════════════════════ */

import { store, escapeHTML } from '../store.js';
import { renderHeader } from '../components/header.js';
import { openModal, closeModal, getModalFormData } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { escapeHTML, sanitizeUrl } from '../utils/sanitize.js';

const CATEGORIES = [
    { value: 'general', label: 'General', icon: '🔗' },
    { value: 'social', label: 'Social Media', icon: '📱' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'payment', label: 'Payment', icon: '💳' },
    { value: 'event', label: 'Event', icon: '🎉' },
    { value: 'portfolio', label: 'Portfolio', icon: '🎨' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'other', label: 'Other', icon: '📌' },
];

function getCategoryInfo(val) {
    return CATEGORIES.find(c => c.value === val) || CATEGORIES[0];
}

function linkFormContent(link = null) {
    return `
    <div class="form-group">
      <label class="form-label" for="linkTitle">Title</label>
      <input class="form-input" type="text" id="linkTitle" name="title"
        placeholder="e.g. My Instagram" value="${escapeHTML(link?.title || '')}" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="linkUrl">URL</label>
      <input class="form-input" type="url" id="linkUrl" name="url"
        placeholder="https://..." value="${escapeHTML(link?.url || '')}" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="linkCategory">Category</label>
      <select class="form-select" id="linkCategory" name="category">
        ${CATEGORIES.map(c => `
          <option value="${c.value}" ${link?.category === c.value ? 'selected' : ''}>
            ${c.icon} ${c.label}
          </option>
        `).join('')}
      </select>
    </div>
  `;
}

export function renderLinks() {
    const container = document.getElementById('page-content');
    const links = store.links;

    // Pre-calculate tags per link to avoid O(N*M) lookups in renderLinkCard
    const tagsByLinkId = new Map();
    store.tags.forEach(tag => {
        if (tag.assignedLinkId) {
            if (!tagsByLinkId.has(tag.assignedLinkId)) {
                tagsByLinkId.set(tag.assignedLinkId, []);
            }
            tagsByLinkId.get(tag.assignedLinkId).push(tag);
        }
    });

    container.innerHTML = `
    ${renderHeader('Links', 'Manage your destination URLs')}

    <div class="page-container">
      <div class="links-toolbar">
        <div class="search-bar">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input class="form-input" type="text" id="linkSearch" aria-label="Search links" placeholder="Search links...">
        </div>
        <div class="toolbar-actions">
          <select class="form-select" id="categoryFilter" aria-label="Filter by category" style="width: auto; min-width: 150px;">
            <option value="">All Categories</option>
            ${CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${c.label}</option>`).join('')}
          </select>
          <button class="btn btn-primary" id="addLinkBtn">
            <span>➕</span> New Link
          </button>
        </div>
      </div>

      <div class="links-grid grid grid-3" id="linksGrid">
        ${links.length === 0 ? `
          <div class="empty-state" style="grid-column: 1 / -1">
            <div class="empty-state-icon">🔗</div>
            <h3 class="empty-state-title">No links yet</h3>
            <p class="empty-state-desc">Create your first link to assign to NFC tags.</p>
            <button class="btn btn-primary" id="emptyAddLink">➕ Create Link</button>
          </div>
        ` : links.map((link, i) => renderLinkCard(link, i, tagsByLinkId)).join('')}
      </div>
    </div>
  `;

    initLinksEvents();
}

function renderLinkCard(link, index, tagsByLinkId) {
    const cat = getCategoryInfo(link.category);
    const assignedTags = tagsByLinkId.get(link.id) || [];

    return `
    <div class="link-card card animate-fade-up" style="animation-delay: ${0.05 * index}s" data-id="${link.id}">
      <div class="link-card-header">
        <span class="link-icon" aria-hidden="true">${cat.icon}</span>
        <div class="link-card-actions">
          <button class="btn btn-ghost btn-icon edit-link" data-id="${link.id}" title="Edit" aria-label="Edit link">✏️</button>
          <button class="btn btn-ghost btn-icon delete-link" data-id="${link.id}" title="Delete" aria-label="Delete link">🗑️</button>
        </div>
      </div>
      <h3 class="link-title">${escapeHTML(link.title)}</h3>
      <a class="link-url truncate" href="${escapeHTML(link.url)}" target="_blank" rel="noopener">${escapeHTML(link.url)}</a>
      <div class="link-meta">
        <span class="badge badge-primary">${escapeHTML(cat.label)}</span>
        ${assignedTags.length > 0 ? `<span class="badge badge-success">🏷️ ${assignedTags.length} tag${assignedTags.length > 1 ? 's' : ''}</span>` : ''}
        <span class="link-clicks">👆 ${link.clicks} tap${link.clicks !== 1 ? 's' : ''}</span>
      </div>
    </div>
  `;
}

function initLinksEvents() {
    // Copy link
    document.querySelectorAll('.copy-link').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            try {
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy link', 'error');
            }
        });
    });

    // Add link
    const openAddModal = () => {
        openModal({
            title: 'Create New Link',
            content: linkFormContent(),
            submitLabel: 'Create',
            onSubmit: () => {
                const data = getModalFormData();
                if (!data.title || !data.url) {
                    showToast('Please fill in all fields', 'warning');
                    return;
                }
                try {
                    new URL(data.url);
                } catch {
                    showToast('Please enter a valid URL', 'error');
                    return;
                }
                store.createLink(data);
                closeModal();
                showToast(`Link "${escapeHTML(data.title)}" created!`, 'success');
                renderLinks();
            },
        });
    };

    document.getElementById('addLinkBtn')?.addEventListener('click', openAddModal);
    document.getElementById('emptyAddLink')?.addEventListener('click', openAddModal);

    // Copy link
    document.querySelectorAll('.copy-link').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            try {
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard!', 'success');
            } catch (err) {
                showToast('Failed to copy link', 'error');
                console.error('Copy failed', err);
            }
        });
    });

    // Copy link
    document.querySelectorAll('.copy-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const link = store.getLink(btn.dataset.id);
            if (!link) return;
            navigator.clipboard.writeText(link.url)
                .then(() => showToast('Link copied to clipboard!', 'success'))
                .catch(() => showToast('Failed to copy link', 'error'));
        });
    });

    // Edit link
    document.querySelectorAll('.edit-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const link = store.getLink(editBtn.dataset.id);
            if (!link) return;
            openModal({
                title: 'Edit Link',
                content: linkFormContent(link),
                submitLabel: 'Save Changes',
                onSubmit: () => {
                    const data = getModalFormData();
                    if (!data.title || !data.url) {
                        showToast('Please fill in all fields', 'warning');
                        return;
                    }
                    store.updateLink(link.id, data);
                    closeModal();
                    showToast(`Link updated!`, 'success');
                    renderLinks();
                },
            });
            return;
        }

        // Delete Link
        const deleteBtn = e.target.closest('.delete-link');
        if (deleteBtn) {
            e.stopPropagation();
            const link = store.getLink(deleteBtn.dataset.id);
            if (!link) return;
            openModal({
                title: 'Delete Link',
                content: `<p>Are you sure you want to delete <strong>"${escapeHTML(link.title)}"</strong>? This will also unassign it from any tags.</p>`,
                submitLabel: 'Delete',
                onSubmit: () => {
                    store.deleteLink(link.id);
                    closeModal();
                    showToast(`Link deleted`, 'info');
                    renderLinks();
                },
            });
            return;
        }

        // Empty State Create Link
        const emptyAddBtn = e.target.closest('#emptyAddLink');
        if (emptyAddBtn) {
            openAddLinkModal();
        }
    });

    // Search
    document.getElementById('linkSearch')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        filterLinks(q, document.getElementById('categoryFilter')?.value);
    });

    // Category filter
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        const q = document.getElementById('linkSearch')?.value.toLowerCase() || '';
        filterLinks(q, e.target.value);
    });
}

function filterLinks(search, category) {
    const cards = document.querySelectorAll('.link-card');
    const links = store.links;

    // Pre-calculate map to avoid O(N^2) lookups during filtering
    const linksMap = new Map();
    links.forEach(l => linksMap.set(l.id, l));

    cards.forEach(card => {
        const link = linksMap.get(card.dataset.id);
        if (!link) return;

        const matchSearch = !search ||
            link.title.toLowerCase().includes(search) ||
            link.url.toLowerCase().includes(search);
        const matchCategory = !category || link.category === category;

        card.style.display = matchSearch && matchCategory ? '' : 'none';
    });
}
