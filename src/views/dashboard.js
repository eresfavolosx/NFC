/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Dashboard View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { escapeHTML } from '../utils/security.js';
import { renderHeader } from '../components/header.js';
import { navigate } from '../router.js';
import { escapeHTML } from '../utils/security.js';

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
    const activity = store.activity;

    container.innerHTML = `
    ${renderHeader('Dashboard', 'Overview of your NFC tag operations')}

    <div class="page-container">
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
        <!-- Quick Actions -->
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
            <button class="quick-action-btn" id="qaWriter">
              <span class="qa-icon">📡</span>
              <span class="qa-label">Write Tag</span>
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
                <span class="activity-icon">${ACTIVITY_ICONS[item.type] || '📌'}</span>
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
    document.getElementById('qaWriter')?.addEventListener('click', () => navigate('/writer'));
}
