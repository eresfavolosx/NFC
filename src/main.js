/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Main Entry Point
   ═══════════════════════════════════════════════════════════ */

import './css/global.css';
import './css/components.css';
import './css/pages.css';

import { store } from './store.js';
import { registerRoute, startRouter, navigate, getCurrentRoute } from './router.js';
import { renderSidebar, initSidebarEvents, updateSidebarActive } from './components/sidebar.js';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLinks } from './views/links.js';
import { renderTags } from './views/tags.js';
import { renderWriter } from './views/writer.js';
import { renderSettings } from './views/settings.js';
import { renderAnalytics } from './views/analytics.js';
import { renderTemplates } from './views/templates.js';
import { renderProfile } from './views/profile.js';
import { renderRedirect } from './views/redirect.js';
import { nfc } from './nfc.js';

// ── Guard: redirect to login if not authenticated ──
function authGuard(renderFn) {
  return () => {
    if (!store.isAuthenticated) {
      navigate('/login');
      return;
    }
    ensureAppLayout();
    updateSidebarActive(getCurrentRoute());
    renderFn();
  };
}

function premiumGuard(renderFn) {
    return () => {
        if (!store.isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!store.isPremium()) {
            navigate('/profile');
            showToast('Premium feature. Start your trial or upgrade to access!', 'warning');
            return;
        }
        ensureAppLayout();
        updateSidebarActive(getCurrentRoute());
        renderFn();
    };
}

// ── Ensure the sidebar + main layout is present ──
function ensureAppLayout() {
  const app = document.getElementById('app');
  if (!document.getElementById('sidebar')) {
    const { sidebar, hamburger } = renderSidebar();
    app.innerHTML = '';
    app.classList.add('app-layout');
    app.appendChild(hamburger);
    app.appendChild(sidebar);

    const main = document.createElement('main');
    main.className = 'main-content';
    main.id = 'page-content';
    app.appendChild(main);

    initSidebarEvents();
  }
}

// ── Register Routes ──
registerRoute('/login', () => {
  if (store.isAuthenticated) {
    navigate('/dashboard');
    return;
  }
  const app = document.getElementById('app');
  app.classList.remove('app-layout');
  return renderLogin();
});

registerRoute('/dashboard', authGuard(renderDashboard));
registerRoute('/links', authGuard(renderLinks));
registerRoute('/tags', authGuard(renderTags));
registerRoute('/writer', authGuard(renderWriter));
registerRoute('/settings', authGuard(renderSettings));
registerRoute('/analytics', premiumGuard(renderAnalytics));
registerRoute('/templates', premiumGuard(renderTemplates));
registerRoute('/profile', authGuard(renderProfile));
registerRoute('/r/:id', renderRedirect);

// 404
registerRoute('/404', () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-page">
      <div class="card-glass" style="text-align:center; padding: 3rem">
        <h1 style="font-size: 4rem; margin-bottom: 1rem;">404</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Page not found</p>
        <a href="#/dashboard" class="btn btn-primary">Go to Dashboard</a>
      </div>
    </div>
  `;
});

// ── Boot ──
store.init().then(async () => {
  // Biometric Auth check
  const settings = store.settings;
  if (settings.useBiometrics && nfc.isNative()) {
      const available = await nfc.isBiometricAvailable();
      if (available) {
          const success = await nfc.authenticateWithBiometrics();
          if (!success) {
              // If biometric fails, force login or stay on current guard/login page
              // For now, we just log it and let Pin/Google be fallbacks
              console.warn('Biometric authentication failed or canceled.');
          }
      }
  }
  startRouter();
});

// ── PWA: Register Service Worker ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional
    });
  });
}
// ── Utilities ──

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast animate-fade-in ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info'}`;
  
  const iconMap = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
    <div class="toast-message">${message}</div>
    <button class="toast-close">&times;</button>
  `;
  
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

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
