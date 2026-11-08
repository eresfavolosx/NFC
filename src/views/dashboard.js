/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Dashboard View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderHeader, escapeHTML, showToast } from '../utils.js';

export function renderDashboard() {
    const main = document.getElementById('page-content');
    if (!main) return;
    
    const stats = store.stats;
    const t = (key) => store.t(key);
    
    main.innerHTML = `
      ${renderHeader(t('dashboard'), t('welcome_back'))}
      
      <div class="stats-grid">
        <div class="stat-card card-glass animate-fade-up">
          <div class="stat-value" id="stat-total-links">${stats.totalLinks}</div>
          <div class="stat-label">${t('active_links')}</div>
        </div>
        <div class="stat-card card-glass animate-fade-up" style="animation-delay: 0.1s">
          <div class="stat-value" id="stat-active-tags">${stats.activeTags}</div>
          <div class="stat-label">${t('registered_tags')}</div>
        </div>
        <div class="stat-card card-glass animate-fade-up" style="animation-delay: 0.2s">
          <div class="stat-value" id="stat-total-clicks">${stats.totalClicks}</div>
          <div class="stat-label">${t('total_taps')}</div>
        </div>
      </div>

      <div class="section-card card-glass animate-fade-up" style="margin-top: 1.5rem; animation-delay: 0.25s;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <h2 class="card-title" style="margin: 0;">${t('quick_actions')}</h2>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" id="dash-btn-links">
              <span aria-hidden="true">🔗</span> ${t('create_link')}
            </button>
            <button type="button" class="btn btn-secondary" id="dash-btn-writer">
              <span aria-hidden="true">📡</span> ${t('write_nfc')}
            </button>
            <button type="button" class="btn btn-primary" id="dash-btn-simulate-tap">
              ${t('simulate_tap')}
            </button>
          </div>
        </div>
      </div>

      <div class="section-card card-glass animate-fade-in" style="margin-top: 1.5rem;" aria-live="polite">
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
              <div class="activity-icon" aria-hidden="true">${getActivityIcon(act.type)}</div>
              <div class="activity-content">
                <div class="activity-desc">${escapeHTML(act.message || act.description || '')}</div>
                <div class="activity-time">${new Date(act.timestamp).toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('dash-btn-links')?.addEventListener('click', () => navigate('/links'));
    document.getElementById('dash-btn-writer')?.addEventListener('click', () => navigate('/writer'));
    document.getElementById('dash-btn-simulate-tap')?.addEventListener('click', () => {
        store.simulateTap();
        showToast(t('tap_simulated'), 'success');
        renderDashboard();
    });
}

function getActivityIcon(type) {
    switch(type) {
        case 'tag_registered':
        case 'tag_created': return '💳';
        case 'link_created':
        case 'link_updated': return '🔗';
        case 'link_assigned':
        case 'tag_assigned': return '✨';
        case 'visit': return '⚡';
        default: return '📝';
    }
}
