/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Redirection Handler
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { isValidUrl } from '../utils/sanitize.js';

export function renderRedirect({ id }) {
    const container = document.getElementById('app');
    
    // Tag lookup
    const tag = store.getTag(id);
    
    if (tag && tag.assignedLinkId) {
        const link = store.getLink(tag.assignedLinkId);
        if (link) {
            // Log interaction
            store.incrementClicks(link.id, tag.id);
            
            // Redirect
            if (isValidUrl(link.url)) {
                window.location.href = link.url;
                return;
            } else {
                console.warn('Invalid or unsafe URL detected. Redirection aborted.');
            }
        }
    }

    // 404 or Error State for Redirection
    container.innerHTML = `
        <div class="login-page">
            <div class="card-glass animate-fade-up" style="text-align:center; padding: 3rem; max-width: 400px">
                <div class="stat-icon yellow" style="margin: 0 auto var(--space-md)">📡</div>
                <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Tag Not Found</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    This NFC tag is registered but has no link assigned, or the redirection ID is invalid.
                </p>
                <a href="#/dashboard" class="btn btn-primary">Go to Dashboard</a>
            </div>
        </div>
    `;
}
