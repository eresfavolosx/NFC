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
startRouter();

// ── PWA: Register Service Worker ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional
    });
  });
}
