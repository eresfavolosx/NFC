/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Sidebar Component
   ═══════════════════════════════════════════════════════════ */

import { navigate, getCurrentRoute } from '../router.js';
import { store } from '../store.js';

const NAV_ITEMS = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/links', icon: '🔗', label: 'Links' },
    { path: '/tags', icon: '🏷️', label: 'Tags' },
    { path: '/writer', icon: '📡', label: 'NFC Writer' },
];

export function renderSidebar() {
    const currentPath = getCurrentRoute();

    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar';

    sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">📱</div>
      <span class="sidebar-brand-text">NFC Manager</span>
      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
        <span class="toggle-icon">◀</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(item => `
        <a href="#${item.path}"
           class="sidebar-nav-item ${currentPath === item.path ? 'active' : ''}"
           data-path="${item.path}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-nav-item" id="logoutBtn">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Logout</span>
      </button>
    </div>
  `;

    // Hamburger for mobile
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-btn';
    hamburger.id = 'hamburgerBtn';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.setAttribute('aria-label', 'Open menu');

    return { sidebar, hamburger };
}

export function initSidebarEvents() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburgerBtn');
    const toggle = document.getElementById('sidebarToggle');
    const logoutBtn = document.getElementById('logoutBtn');
    const mainContent = document.querySelector('.main-content');

    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
        });
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Close mobile sidebar on nav click
    sidebar?.querySelectorAll('.sidebar-nav-item[data-path]').forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            store.logout();
            navigate('/login');
        });
    }
}

// Update active state on route change
export function updateSidebarActive(path) {
    document.querySelectorAll('.sidebar-nav-item[data-path]').forEach(item => {
        item.classList.toggle('active', item.dataset.path === path);
    });
}
