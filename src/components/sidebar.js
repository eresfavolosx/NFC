/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Sidebar Component
   ═══════════════════════════════════════════════════════════ */

import { navigate, getCurrentRoute } from '../router.js';
import { store } from '../store.js';

const NAV_ITEMS = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/links', icon: '🔗', label: 'Links' },
    { path: '/tags', icon: '💳', label: 'Tags' },
    { path: '/analytics', icon: '📈', label: 'Analytics', premium: true },
    { path: '/templates', icon: '📋', label: 'Templates', premium: true },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/profile', icon: '👤', label: 'Profile' },
];

const BOTTOM_NAV_ITEMS = [
    { path: '/dashboard', icon: '📊', label: 'Home' },
    { path: '/links', icon: '🔗', label: 'Links' },
    { path: '/tags', icon: '💳', label: 'Tags' },
    { path: '/templates', icon: '📋', label: 'Templates' },
    { path: '/profile', icon: '👤', label: 'Profile' },
];

export function renderBottomNav() {
    const currentPath = getCurrentRoute();
    const nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';

    const items = [...BOTTOM_NAV_ITEMS];
    if (store.isSuperAdmin()) {
        items.splice(3, 0, { path: '/admin', icon: '🛡️', label: 'Admin' });
    }

    nav.innerHTML = `
        <div class="bottom-nav-container">
            ${items.map(item => `
                <a href="#${item.path}" 
                   class="bottom-nav-item ${currentPath === item.path ? 'active' : ''}" 
                   data-path="${item.path}">
                    <span class="bottom-nav-icon">${item.icon}</span>
                    <span class="bottom-nav-label">${item.label}</span>
                </a>
            `).join('')}
        </div>
    `;
    return nav;
}

export function renderSidebar() {
    const currentPath = getCurrentRoute();

    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar';

    const settings = store.settings;
    const brandLabel = settings.brandName || 'Tocaito';

    sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">🍊</div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px;">
        <span class="sidebar-brand-text">${brandLabel}</span>
        <span class="beta-badge-label">🛡️ SUPER ADMIN</span>
      </div>
      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
        <span class="toggle-icon">◀</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(item => `
        <a href="#${item.path}"
           class="sidebar-nav-item ${currentPath === item.path ? 'active' : ''} ${item.premium && !store.isPremium() ? 'nav-locked' : ''}"
           data-path="${item.path}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
      ${store.isSuperAdmin() ? `
        <div class="sidebar-divider" style="height: 1px; background: var(--border-color); margin: 0.5rem 1rem; opacity: 0.3;"></div>
        <a href="#/admin"
           class="sidebar-nav-item ${currentPath === '/admin' ? 'active' : ''}"
           data-path="/admin">
          <span class="nav-icon">🛡️</span>
          <span class="nav-label">Admin Console</span>
        </a>
      ` : ''}
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-nav-item" id="logoutBtn">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Logout</span>
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

    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await store.logout();
            navigate('/login');
        });
    }
}

// Update active state on route change
export function updateSidebarActive(path) {
    // Sidebar items
    document.querySelectorAll('.sidebar-nav-item[data-path]').forEach(item => {
        item.classList.toggle('active', item.dataset.path === path);
    });
    // Bottom nav items
    document.querySelectorAll('.bottom-nav-item[data-path]').forEach(item => {
        item.classList.toggle('active', item.dataset.path === path);
    });
}
