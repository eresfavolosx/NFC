/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Super Admin Console
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader, escapeHTML, showToast } from '../utils.js';
import { openModal } from '../components/modal.js';

export function renderAdmin() {
    const main = document.getElementById('page-content');
    if (!main) return;
    
    // Stats for the admin
    const stats = store.stats;
    const allTags = store.tags;
    const t = (key) => store.t(key);
    
    main.innerHTML = `
      ${renderHeader(t('admin_console'), t('manage_global'))}
      
      <div class="stats-grid">
        <div class="stat-card card-glass">
          <div class="stat-value">${stats.totalTags}</div>
          <div class="stat-label">${t('global_tags')}</div>
        </div>
        <div class="stat-card card-glass">
          <div class="stat-value">${stats.totalLinks}</div>
          <div class="stat-label">${t('global_links')}</div>
        </div>
        <div class="stat-card card-glass">
          <div class="stat-value">${stats.totalClicks}</div>
          <div class="stat-label">${t('total_taps')}</div>
        </div>
      </div>

      <div class="section-card card-glass animate-fade-in" style="margin-top: 2rem;">
        <div class="card-header">
          <h2 class="card-title">🛡️ ${t('global_tags')}</h2>
        </div>

        <div class="table-container animate-fade-up" style="animation-delay: 0.1s">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tag Label</th>
                <th>Serial / ID</th>
                <th>Owner / Client</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${allTags.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    No tags registered in the system yet.
                  </td>
                </tr>
              ` : allTags.map(tag => `
                <tr>
                  <td data-label="Tag Label">
                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(tag.label)}</div>
                    <div class="text-xs text-muted" style="font-size: 0.7rem;">ID: ${tag.id.slice(0, 8)}...</div>
                  </td>
                  <td data-label="Serial / ID"><code style="background: var(--bg-surface); padding: 2px 6px; border-radius: 4px;">${tag.serialNumber ? escapeHTML(tag.serialNumber) : '—'}</code></td>
                  <td data-label="Owner / Client">
                    ${tag.ownerEmail 
                      ? `<div style="font-size: 0.85rem; color: var(--color-primary); font-weight: 500;">${escapeHTML(tag.ownerEmail)}</div>`
                      : `<span class="text-muted" style="font-size: 0.8rem; font-style: italic;">Unassigned</span>`}
                  </td>
                  <td data-label="Status">
                    ${tag.assignedLinkId 
                      ? '<span class="badge badge-success">Active</span>' 
                      : (tag.ownerEmail ? '<span class="badge badge-warning">Provisioned</span>' : '<span class="badge">Unassigned</span>')}
                  </td>
                  <td data-label="Created">${new Date(tag.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                      <button class="btn btn-sm btn-outline assign-btn" data-tag-id="${tag.id}">${t('assign_to_client')}</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event Listeners for Admin Actions
    main.querySelectorAll('.assign-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tagId = btn.dataset.tagId;
            const emails = store.allClientEmails;
            
            openModal({
                title: `👥 ${t('assign_to_client')}`,
                content: `
                    <div class="form-group">
                        <label class="form-label" for="assign-email-select">${t('select_client')}</label>
                        <select class="form-select" id="assign-email-select">
                            <option value="">— Select an existing client —</option>
                            ${emails.map(e => `<option value="${e}">${e}</option>`).join('')}
                        </select>
                    </div>
                    <div style="text-align: center; margin: 1.5rem 0; position: relative;">
                        <hr style="border: none; border-top: 1px solid var(--border-color);">
                        <span style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); background: var(--bg-surface-elevated); padding: 0 10px; font-size: 0.75rem; color: var(--text-muted);">OR</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="assign-email-custom">${t('new_client_email')}</label>
                        <input class="form-input" id="assign-email-custom" type="email" placeholder="client@example.com">
                    </div>
                `,
                submitLabel: t('assign_and_provision'),
                onSubmit: () => {
                    const selectedEmail = document.getElementById('assign-email-select').value;
                    const customEmail = document.getElementById('assign-email-custom').value.trim();
                    const email = customEmail || selectedEmail;

                    if (email && email.includes('@')) {
                        const success = store.assignTagToUser(tagId, email);
                        if (success) {
                            showToast(`${t('success')}: Tag provisioned to ${email}`, 'success');
                            renderAdmin(); // Refresh view
                        }
                    } else {
                        showToast(t('error'), 'error');
                    }
                }
            });
        });
    });
}
