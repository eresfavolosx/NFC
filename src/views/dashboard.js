/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Dashboard View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader } from '../components/header.js';
import { navigate } from '../router.js';
import { escapeHTML } from '../utils/sanitize.js';
import { openModal, closeModal, getModalFormData } from '../components/modal.js';
import { showToast } from '../components/toast.js';

function formatTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const ACTIVITY_ICONS = {
    link_created: '🔗',
    link_updated: '✏️',
    link_deleted: '🗑️',
    tag_created: '🏷️',
    tag_assigned: '📡',
    tag_deleted: '🗑️',
};

export function renderDashboard() {
    const container = document.getElementById('page-content');
    const stats = store.stats;
    const settings = store.settings;
    const activity = store.activity;
    const totalLinks = store.links.length;
    const totalTags = store.tags.length;
    const totalScans = (store.analytics || []).length;

    container.innerHTML = `
        ${renderHeader('Control Center', `Welcome back, ${store.user?.displayName || 'Admin'}`)}

        <div class="page-container">
            <div class="stats-grid">
                <div class="stat-card animate-fade-up">
                    <div class="stat-label">Active Links</div>
                    <div class="stat-value">${totalLinks}</div>
                    <div class="stat-trend trend-up">Ready to program</div>
                </div>
                <div class="stat-card animate-fade-up" style="animation-delay: 0.1s">
                    <div class="stat-label">Registered Tags</div>
                    <div class="stat-value">${totalTags}</div>
                    <div class="stat-trend">Assets in field</div>
                </div>
                <div class="stat-card animate-fade-up" style="animation-delay: 0.2s">
                    <div class="stat-label">Total Scans</div>
                    <div class="stat-value">${totalScans}</div>
                    <div class="stat-trend trend-up">Engagement data</div>
                </div>
            </div>
      <!-- Stats Grid -->
      <div class="grid grid-4 dashboard-stats">
        <div class="stat-card animate-fade-up" style="animation-delay: 0.05s">
          <div class="stat-icon purple">🔗</div>
          <div>
            <div class="stat-value" data-count="${stats.totalLinks}">${stats.totalLinks}</div>
            <div class="stat-label">Total Links</div>
          </div>
        </div>
        <div class="stat-card animate-fade-up" style="animation-delay: 0.1s">
          <div class="stat-icon teal">🏷️</div>
          <div>
            <div class="stat-value" data-count="${stats.totalTags}">${stats.totalTags}</div>
            <div class="stat-label">Registered Tags</div>
          </div>
        </div>
        <div class="stat-card animate-fade-up" style="animation-delay: 0.15s">
          <div class="stat-icon pink">📡</div>
          <div>
            <div class="stat-value" data-count="${stats.assignedTags}">${stats.assignedTags}</div>
            <div class="stat-label">Assigned Tags</div>
          </div>
        </div>
        <div class="stat-card animate-fade-up" style="animation-delay: 0.2s">
          <div class="stat-icon yellow">👆</div>
          <div>
            <div class="stat-value" data-count="${stats.totalClicks}">${stats.totalClicks}</div>
            <div class="stat-label">Total Taps</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Magic Setup (If empty) -->
        ${settings.restaurantMode && totalLinks === 0 && totalTags === 0 ? `
          <div class="card animate-fade-up restaurant-magic-setup" style="grid-column: 1 / -1; padding: 3rem; text-align: center; border: 2px dashed var(--color-primary); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--space-xl);">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">🪄</div>
            <h2 class="card-title" style="font-size: 1.75rem; margin-bottom: 0.75rem;">Magic Restaurant Setup</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; max-width: 500px; margin-inline: auto; font-size: 1.1rem;">
              Set up your entire restaurant with digital menu tags in one go. Just provide your menu link and table count!
            </p>
            <button class="btn btn-primary btn-lg" id="startMagicSetup">
              Start Building Now
            </button>
          </div>
        ` : ''}

        <!-- Restaurant Onboarding (Conditional) -->
        ${settings.restaurantMode && (totalLinks > 0 || totalTags > 0) ? `
          <div class="card animate-fade-up restaurant-onboarding-card" style="animation-delay: 0.22s">
            <div class="card-header">
              <h2 class="card-title">🍴 Restaurant Progress</h2>
            </div>
            <div class="restaurant-onboarding">
              <div class="onboarding-steps">
                <div class="onboarding-step ${stats.totalLinks > 0 ? 'done' : ''}">
                  <span class="step-icon">${stats.totalLinks > 0 ? '✅' : '1️⃣'}</span>
                  <span>Menu Link Created</span>
                </div>
                <div class="onboarding-step ${stats.totalTags > 0 ? 'done' : ''}">
                  <span class="step-icon">${stats.totalTags > 0 ? '✅' : '2️⃣'}</span>
                  <span>Tables Registered</span>
                </div>
                <div class="onboarding-step ${stats.assignedTags > 0 ? 'done' : ''}">
                  <span class="step-icon">${stats.assignedTags > 0 ? '✅' : '3️⃣'}</span>
                  <span>Links Assigned to Tags</span>
                </div>
              </div>
              <div class="onboarding-actions">
                <button class="btn btn-secondary w-full" id="bulkRegisterTables">
                  <span>🪑</span> Add More Tables
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="card animate-fade-up" style="animation-delay: 0.25s">
          <div class="card-header">
            <h2 class="card-title">Quick Actions</h2>
          </div>
          <div class="quick-actions">
            <button class="quick-action-btn" id="qaNewLink">
              <span class="qa-icon">➕</span>
              <span class="qa-label">New Link</span>
            </button>
            <button class="quick-action-btn" id="qaNewTag">
              <span class="qa-icon">🏷️</span>
              <span class="qa-label">Add Tag</span>
            </button>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="card animate-fade-up" style="animation-delay: 0.3s">
          <div class="card-header">
            <h2 class="card-title">Recent Activity</h2>
          </div>
          <div class="activity-feed">
            ${activity.length === 0 ? `
              <div class="empty-state" style="padding: var(--space-lg) 0">
                <div class="empty-state-icon">📋</div>
                <p class="empty-state-desc">No activity yet. Create a link or register a tag to get started.</p>
              </div>
            ` : activity.slice(0, 8).map(item => `
              <div class="activity-item">
                <span class="activity-icon" aria-hidden="true">${ACTIVITY_ICONS[item.type] || '📌'}</span>
                <div class="activity-content">
                  <span class="activity-message">${escapeHTML(item.message)}</span>
                  <span class="activity-time">${formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

    // Quick action handlers
    document.getElementById('qaNewLink')?.addEventListener('click', () => navigate('/links'));
    document.getElementById('qaNewTag')?.addEventListener('click', () => navigate('/tags'));

    // Magic Setup
    document.getElementById('startMagicSetup')?.addEventListener('click', () => {
        openModal({
            title: '🪄 Magic Restaurant Setup',
            content: `
                <p style="margin-bottom: var(--space-md); color: var(--text-secondary);">Enter your restaurant details to automatically create your menu link and table tags.</p>
                <div class="form-group">
                    <label class="form-label">Restaurant Name</label>
                    <input class="form-input" type="text" name="name" value="${settings.restaurantName || ''}" placeholder="e.g. The Italian Bistro">
                </div>
                <div class="form-group">
                    <label class="form-label">Digital Menu URL</label>
                    <input class="form-input" type="url" name="menuUrl" placeholder="https://yourmenu.com or instagram.com/menu">
                </div>
                <div class="form-group">
                    <label class="form-label">Total Number of Tables</label>
                    <input class="form-input" type="number" name="tableCount" value="10" min="1" max="50">
                </div>
            `,
            submitLabel: 'Setup Restaurant',
            onSubmit: () => {
                const data = getModalFormData();
                const tableCount = parseInt(data.tableCount);
                if (!data.menuUrl || isNaN(tableCount)) {
                    showToast('Please provide a menu URL and table count', 'warning');
                    return;
                }

                // 1. Update restaurant name
                if (data.name) {
                    store.updateSettings({ restaurantName: data.name });
                }

                // 2. Create the menu link
                const link = store.createLink({
                    title: 'Digital Menu',
                    url: data.menuUrl,
                    category: 'business'
                });

                // 3. Create bulk tags and assign them
                const tags = store.createBulkTags('Table', tableCount);
                tags.forEach(t => store.assignLinkToTag(t.id, link.id));

                closeModal();
                showToast(`Magic setup complete! Created menu and ${tableCount} tables.`, 'success');
                renderDashboard();
            }
        });
    });

    // Bulk Register Tables
    document.getElementById('bulkRegisterTables')?.addEventListener('click', () => {
        openModal({
            title: 'Bulk Register Tables',
            content: `
                <div class="form-group">
                    <label class="form-label">Table Name Prefix</label>
                    <input class="form-input" type="text" name="prefix" value="Table" placeholder="e.g. Table">
                </div>
                <div class="form-group">
                    <label class="form-label">Number of Tables</label>
                    <input class="form-input" type="number" name="count" value="10" min="1" max="50">
                </div>
            `,
            submitLabel: 'Create Tables',
            onSubmit: () => {
                const data = getModalFormData();
                const count = parseInt(data.count);
                if (isNaN(count) || count <= 0) {
                    showToast('Invalid number of tables', 'error');
                    return;
                }
                store.createBulkTags(data.prefix || 'Table', count);
                closeModal();
                showToast(`Successfully registered ${count} tables!`, 'success');
                renderDashboard();
            }
        });
    });
}
