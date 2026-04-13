/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Sidebar Component
   ═══════════════════════════════════════════════════════════ */

import { navigate, getCurrentRoute } from '../router.js';
import { store } from '../store.js';

export function renderBottomNav() {
    const currentPath = getCurrentRoute();
    const t = (key) => store.t(key);
    
    const nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';

    const items = [
        { path: '/dashboard', icon: '📊', label: t('dashboard') },
        { path: '/links', icon: '🔗', label: t('links') },
        { path: '/tags', icon: '💳', label: t('tags') },
        { path: '/templates', icon: '📋', label: t('templates') },
        { path: '/profile', icon: '👤', label: t('profile') },
    ];
    
    if (store.isSuperAdmin()) {
        items.splice(3, 0, { path: '/admin', icon: '🛡️', label: t('admin') });
    }

    nav.innerHTML = `
        <div class="bottom-nav-container">
            ${items.map(item => `
                <a href="#${item.path}" 
                   class="bottom-nav-item ${currentPath === item.path ? 'active' : ''}" 
                   data-path="${item.path}">
                    <span class="bottom-nav-icon" aria-hidden="true">${item.icon}</span>
                    <span class="bottom-nav-label">${item.label}</span>
                </a>
            `).join('')}
        </div>
    `;
    return nav;
}

export function renderSidebar() {
    const currentPath = getCurrentRoute();
    const t = (key) => store.t(key);

    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar';

    const settings = store.settings;
    const brandLabel = settings.brandName || 'Tocaito';
    const lang = settings.language || 'es';

    const navItems = [
        { path: '/dashboard', icon: '📊', label: t('dashboard') },
        { path: '/links', icon: '🔗', label: t('links') },
        { path: '/tags', icon: '💳', label: t('tags') },
        { path: '/analytics', icon: '📈', label: t('analytics'), premium: true },
        { path: '/templates', icon: '📋', label: t('templates'), premium: true },
        { path: '/settings', icon: '⚙️', label: t('settings') },
        { path: '/profile', icon: '👤', label: t('profile') },
    ];

    sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">🍊</div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px;">
        <span class="sidebar-brand-text">${brandLabel}</span>
        ${store.isSuperAdmin() ? `<span class="beta-badge-label">🛡️ ${t('admin').toUpperCase()}</span>` : ''}
      </div>
      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
        <span class="toggle-icon">◀</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <a href="#${item.path}"
           class="sidebar-nav-item ${currentPath === item.path ? 'active' : ''} ${item.premium && !store.isPremium() ? 'nav-locked' : ''}"
           data-path="${item.path}"
           ${item.premium && !store.isPremium() ? 'aria-disabled="true" tabindex="-1"' : ''}>
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
      ${store.isSuperAdmin() ? `
        <div class="sidebar-divider" style="height: 1px; background: var(--border-color); margin: 0.5rem 1rem; opacity: 0.3;"></div>
        <a href="#/admin"
           class="sidebar-nav-item ${currentPath === '/admin' ? 'active' : ''}"
           data-path="/admin">
          <span class="nav-icon">🛡️</span>
          <span class="nav-label">${t('admin_console')}</span>
        </a>
      ` : ''}
    </nav>

    <div class="sidebar-footer">
      <div style="padding: 0 1rem 1rem; display: flex; gap: 0.5rem;">
        <button class="btn-lang ${lang === 'es' ? 'active' : ''}" id="lang-es">ES</button>
        <button class="btn-lang ${lang === 'en' ? 'active' : ''}" id="lang-en">EN</button>
      </div>
      <button class="sidebar-nav-item" id="logoutBtn">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">${t('logout')}</span>
      </button>
    </div>
  `;

    const bottomNav = renderBottomNav();

    return { sidebar, bottomNav };
}

export function initSidebarEvents() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const logoutBtn = document.getElementById('logoutBtn');
    const mainContent = document.querySelector('.main-content');
    const langEs = document.getElementById('lang-es');
    const langEn = document.getElementById('lang-en');

    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> <span class="nav-label" style="margin-left: 8px;">Logging out...</span>`;
            try {
                await store.logout();
                navigate('/login');
            } catch {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        });
    }

    if (langEs) {
        langEs.addEventListener('click', () => {
            store.setLanguage('es');
            location.reload(); // Refresh to apply translations
        });
    }
    if (langEn) {
        langEn.addEventListener('click', () => {
            store.setLanguage('en');
            location.reload(); // Refresh to apply translations
        });
    }
}

export function updateSidebarActive(path) {
    document.querySelectorAll('.sidebar-nav-item[data-path]').forEach(item => {
        item.classList.toggle('active', item.dataset.path === path);
    });
    document.querySelectorAll('.bottom-nav-item[data-path]').forEach(item => {
        item.classList.toggle('active', item.dataset.path === path);
    });
}
