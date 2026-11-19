/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Analytics Dashboard
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';

export function renderAnalytics() {
    const container = document.getElementById('page-content');
    if (!container) return;

    const analytics = store.analytics;
    const links = store.links;

    // Calculate Stats
    const totalScans = analytics.length;
    const cutoff24h = Date.now() - 86400000;
    const scansLast24h = analytics.filter(a => {
        const ts = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(a.timestamp);
        return Number.isFinite(ts) && ts > cutoff24h;
    }).length;

    // Most scanned links
    const topLinks = [...links]
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 5);

    const recentScans = [...analytics]
        .sort((a, b) => {
            const ta = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(a.timestamp) || 0;
            const tb = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(b.timestamp) || 0;
            return tb - ta;
        })
        .slice(0, 10);

    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Analytics</h1>
                <p class="page-subtitle">Track engagement and customer scans</p>
            </div>
            <button class="btn btn-secondary" id="exportCsvBtn">
                <span aria-hidden="true">📊</span> Export CSV
            </button>
        </div>

        <div class="page-container">
            <div class="stats-grid">
                <div class="stat-card animate-fade-up">
                    <div class="stat-label">Total Lifetime Scans</div>
                    <div class="stat-value">${totalScans}</div>
                    <div class="stat-trend trend-up">↑ Scans from all tags</div>
                </div>
                <div class="stat-card animate-fade-up" style="animation-delay: 0.1s">
                    <div class="stat-label">Last 24 Hours</div>
                    <div class="stat-value">${scansLast24h}</div>
                    <div class="stat-trend ${scansLast24h > 0 ? 'trend-up' : ''}">Engagement today</div>
                </div>
            </div>

            <div class="card-glass animate-fade-up" style="margin-top: var(--space-xl); animation-delay: 0.2s">
                <h2 class="section-title">Top Performing Links</h2>
                <div class="analytics-list">
                    ${topLinks.length === 0 ? '<p class="empty-state-desc">No scan data yet.</p>' : topLinks.map(l => `
                        <div class="analytics-item">
                            <div class="analytics-info">
                                <span class="analytics-icon">${escapeHTML(l.icon || '🔗')}</span>
                                <div>
                                    <div class="analytics-name">${escapeHTML(l.title)}</div>
                                    <div class="analytics-url">${escapeHTML(l.url)}</div>
                                </div>
                            </div>
                            <div class="analytics-count">
                                <span class="count-number">${Number(l.clicks) || 0}</span>
                                <span class="count-label">scans</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card-glass animate-fade-up" style="margin-top: var(--space-xl); animation-delay: 0.3s">
                <h2 class="section-title">Recent Activity</h2>
                <div class="recent-scans">
                    ${recentScans.length === 0 ? '<p class="empty-state-desc">Waiting for first scan...</p>' :
                      recentScans.map(a => {
                        const link = store.getLink(a.linkId) || store.getPublicLink(a.linkId);
                        const tag = a.tagId ? (store.getTag(a.tagId) || store.getPublicTag(a.tagId)) : null;
                        const timeLabel = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return `
                            <div class="scan-log-item">
                                <div class="scan-time">${escapeHTML(timeLabel)}</div>
                                <div class="scan-details">
                                    <strong>${escapeHTML(link?.title || 'Unknown')}</strong> scanned via 
                                    <span>${escapeHTML(tag?.label || 'Direct Link')}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    // CSV Export Event
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        const csv = store.exportToCSV();
        if (!csv) {
            showToast('No data to export yet!', 'warning');
            return;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `nfc_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });
}
