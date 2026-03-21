/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Super Admin Console
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader, escapeHTML } from '../utils.js';

export function renderAdmin() {
    const main = document.getElementById('page-content');
    
    // Stats for the admin
    const stats = store.stats;
    const allTags = store.tags;
    
    main.innerHTML = `
      ${renderHeader('Super Admin Console', 'Manage global system state and all client tags.')}
      
      <div class="stats-grid">
        <div class="stat-card card-glass">
          <div class="stat-value">${stats.totalTags}</div>
          <div class="stat-label">Global Tags</div>
        </div>
        <div class="stat-card card-glass">
          <div class="stat-value">${stats.totalLinks}</div>
          <div class="stat-label">Global Links</div>
        </div>
        <div class="stat-card card-glass">
          <div class="stat-value">${stats.totalClicks}</div>
          <div class="stat-label">Total Interactions</div>
        </div>
      </div>

      <div class="section-card card-glass animate-fade-in" style="margin-top: 2rem;">
        <div class="card-header">
          <h2 class="card-title">🛡️ Global Tag Management</h2>
          <p class="card-subtitle">Showing all tags registered across the platform.</p>
        </div>

        <div class="table-container animate-fade-up" style="animation-delay: 0.3s">
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
                  <td data-label="Serial / ID"><code style="background: var(--bg-surface); padding: 2px 6px; border-radius: 4px;">${tag.serialNumber || '—'}</code></td>
                  <td data-label="Owner / Client">
                    ${tag.ownerEmail 
                      ? `<div style="font-size: 0.85rem; color: var(--color-primary); font-weight: 500;">${tag.ownerEmail}</div>`
                      : '<span class="text-muted" style="font-size: 0.8rem italic;">Unassigned</span>'}
                  </td>
                  <td data-label="Status">
                    ${tag.assignedLinkId 
                      ? '<span class="badge badge-success">Active</span>' 
                      : (tag.ownerEmail ? '<span class="badge badge-warning">Provisioned</span>' : '<span class="badge">Unassigned</span>')}
                  </td>
                  <td data-label="Created">${new Date(tag.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                      <button class="btn btn-sm btn-outline" onclick="window.assignTag('${tag.id}')">Assign</button>
                      <button class="btn btn-sm" onclick="alert('Admin: View client logic coming soon')">View</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    <script>
        window.assignTag = (id) => {
            const email = prompt('Enter Client Email to assign this tag:');
            if (email && email.includes('@')) {
                import('../store.js').then(({ store }) => {
                    store.assignTagToUser(id, email);
                    window.location.reload(); // Quick refresh for admin
                });
            }
        };
    </script>

      <div class="section-card card-glass animate-fade-in" style="margin-top: 2rem;">
        <div class="card-header">
          <h2 class="card-title">👥 Client Overview</h2>
          <p class="card-subtitle">System users and their active tiers.</p>
        </div>
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>Multi-client database sync is active. Client details are aggregated in the cloud link management system.</p>
        </div>
      </div>
    `;
}
