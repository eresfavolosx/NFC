/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Utility Functions
   ═══════════════════════════════════════════════════════════ */

import { escapeHTML } from './utils/sanitize.js';
export { escapeHTML };
export { showToast } from './components/toast.js';
export { renderHeader } from './components/header.js';

export function navigate(path) {
    window.location.hash = path;
}

export function renderViewSkeleton(label = 'Loading workspace data') {
    const cleanLabel = escapeHTML(typeof label === 'string' && label.trim() ? label.trim() : 'Loading workspace data');
    return `
        <div class="page-container" aria-busy="true">
            <progress aria-label="${cleanLabel}" class="sr-only"></progress>
            <div aria-hidden="true" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="skeleton-block" style="height: 36px; width: min(320px, 75%);"></div>
                <div class="skeleton-block" style="height: 16px; width: min(440px, 90%);"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                    <div class="skeleton-block" style="height: 112px;"></div>
                    <div class="skeleton-block" style="height: 112px;"></div>
                    <div class="skeleton-block" style="height: 112px;"></div>
                </div>
                <div class="skeleton-block" style="height: 240px;"></div>
            </div>
        </div>
    `;
}
