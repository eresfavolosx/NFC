/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Utility Functions
   ═══════════════════════════════════════════════════════════ */

export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function showToast(message, type = 'info') {
    console.log(`[Toast] ${type}: ${message}`);
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast animate-fade-in ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info'}`;
    
    const iconMap = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    
    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
      <div class="toast-message"></div>
      <button class="toast-close">&times;</button>
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
