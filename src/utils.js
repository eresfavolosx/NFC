/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Utility Functions
   ═══════════════════════════════════════════════════════════ */

import { escapeHTML } from './utils/sanitize.js';
export { escapeHTML };

export function showToast(message, type = 'info') {
    console.log(`[Toast] ${type}: ${message}`);
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast animate-fade-in ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info'}`;
    
    const iconMap = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    
    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
      <div class="toast-message"></div>
      <button class="toast-close" aria-label="Close">✕</button>
    `;
    toast.querySelector('.toast-message').textContent = message;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => toast.remove();
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
}

export function navigate(path) {
    window.location.hash = path;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

export function renderHeader(title, subtitle = '') {
    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">${escapeHTML(title)}</h1>
                ${subtitle ? `<p class="page-subtitle">${escapeHTML(subtitle)}</p>` : ''}
            </div>
        </div>
    `;
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
