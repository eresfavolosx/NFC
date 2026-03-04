/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Toast Component
   ═══════════════════════════════════════════════════════════ */

let toastContainer = null;

function getContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

const ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export function showToast(message, type = 'info', duration = 3500) {
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-up`;
    toast.innerHTML = `
    <span class="toast-icon">${ICONS[type]}</span>
    <span class="toast-message"></span>
    <button class="toast-close" aria-label="Close">✕</button>
  `;
    // Security: Use textContent to prevent DOM XSS when setting arbitrary messages
    toast.querySelector('.toast-message').textContent = message;

    container.appendChild(toast);

    const dismiss = () => {
        toast.style.animation = 'fadeInUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 280);
    };

    toast.querySelector('.toast-close').addEventListener('click', dismiss);

    setTimeout(dismiss, duration);
}
