/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Dashboard View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader, escapeHTML } from '../utils.js';

export function renderDashboard() {
    const main = document.getElementById('page-content');
    if (!main) return;
    
    const stats = store.stats;
    const t = (key) => store.t(key);
    
    main.innerHTML = `
      ${renderHeader(t('dashboard'), t('welcome_back'))}
      
      <div class="stats-grid">
        <div class="stat-card card-glass animate-fade-up">
          <div class="stat-value">${stats.totalLinks}</div>
          <div class="stat-label">${t('active_links')}</div>
        </div>
        <div class="stat-card card-glass animate-fade-up" style="animation-delay: 0.1s">
          <div class="stat-value">${stats.activeTags}</div>
          <div class="stat-label">${t('registered_tags')}</div>
        </div>
        <div class="stat-card card-glass animate-fade-up" style="animation-delay: 0.2s">
          <div class="stat-value">${stats.totalClicks}</div>
          <div class="stat-label">${t('total_taps')}</div>
        </div>
      </div>

      <div class="section-card card-glass animate-fade-in" style="margin-top: 2rem;">
        <div class="card-header">
          <h2 class="card-title">${t('recent_activity')}</h2>
        </div>
        
        <div class="activity-feed">
          ${stats.recentActivity.length === 0 ? `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
              ${t('no_activity')}
            </div>
          ` : stats.recentActivity.map(act => `
            <div class="activity-item">
              <div class="activity-icon">${getActivityIcon(act.type)}</div>
              <div class="activity-content">
                <div class="activity-desc">${escapeHTML(act.description)}</div>
                <div class="activity-time">${new Date(act.timestamp).toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
}

function getActivityIcon(type) {
    switch(type) {
        case 'tag_registered': return '💳';
        case 'link_created': return '🔗';
        case 'link_assigned': return '✨';
        case 'visit': return '🖱️';
        default: return '📝';
    }
}
