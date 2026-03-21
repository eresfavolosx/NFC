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
import { showToast, renderHeader, escapeHTML } from './utils.js';

console.log('Main.js loading...');

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
console.log('App initialization started...');
store.init().then(async () => {
  console.log('Store initialized. Checking nfcCompat...');
  // Ensure nfcCompat is updated on boot if not already done in store.init
  if (!store.nfcCompat || store.nfcCompat.platform === 'loading') {
      try {
          store.data.settings.nfcCompat = await nfc.getCompatibilityInfo();
          store._notify();
      } catch (e) {
          console.error('Failed to get compatibility info:', e);
      }
  }
  
  console.log('Checking biometrics...');
  // Biometric Auth check
  const settings = store.settings;
  if (settings.useBiometrics && nfc.isNative()) {
      try {
          const available = await nfc.isBiometricAvailable();
          if (available) {
              const success = await nfc.authenticateWithBiometrics();
              if (!success) {
                  console.warn('Biometric authentication failed or canceled.');
              }
          }
      } catch (e) {
          console.error('Biometric check error:', e);
      }
  }
  console.log('Starting router...');
  startRouter();
}).catch(err => {
    console.error('App boot failure:', err);
    document.getElementById('app').innerHTML = `<div style="padding: 2rem; color: white;">Critical Error: ${err.message}</div>`;
});

// ── PWA: Register Service Worker ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional
    });
  });
}
// Utilities moved to ./utils.js
