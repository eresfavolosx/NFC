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
import { renderAdmin } from './views/admin.js';
import { nfc } from './nfc.js';
import { showToast, renderHeader, escapeHTML } from './utils.js';
import { openModal, closeModal, getModalFormData } from './components/modal.js';

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

function adminGuard(renderFn) {
    return () => {
        if (!store.isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!store.isSuperAdmin()) {
            navigate('/dashboard');
            showToast('Access Denied: Super Admin only.', 'error');
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
    const { sidebar, bottomNav } = renderSidebar();
    app.innerHTML = '';
    app.classList.add('app-layout');
    app.appendChild(sidebar);
    app.appendChild(bottomNav);

    const main = document.createElement('main');
    main.className = 'main-content';
    main.id = 'page-content';
    app.appendChild(main);

    initSidebarEvents();
    initializeGlobalFAB();
  }
}

/**
 * FAB (Floating Action Button) for all users
 * Initiates an extremely simple NFC Write Wizard
 */
function initializeGlobalFAB() {
    const app = document.getElementById('app');
    if (!app || document.getElementById('global-fab-root')) return;

    // ONLY the Super Admin can see the global "Write" button
    if (!store.isSuperAdmin()) return;

    const fabRoot = document.createElement('div');
    fabRoot.id = 'global-fab-root';
    fabRoot.className = 'fab-container animate-fade-in';
    fabRoot.style.animationDelay = '1s';
    fabRoot.innerHTML = `
        <span class="fab-label">Write NFC Tag</span>
        <button class="fab" id="mainWriteFab" aria-label="Write NFC Tag">
            <span class="fab-icon">📡</span>
        </button>
    `;
    app.appendChild(fabRoot);

    document.getElementById('mainWriteFab')?.addEventListener('click', () => {
        openWriteWizard();
    });
}

/**
 * NFC Write Wizard — Simplifies the programming logic
 */
function openWriteWizard() {
    // STEP 1: Content Picker
    const showStep1 = () => {
        const links = store.links;

        openModal({
            title: '📡 Write Wizard: Step 1',
            content: `
                <div class="wizard-intro">
                    <p style="margin-bottom: var(--space-md); color: var(--text-secondary);">Select the content you want to program onto your NFC tag.</p>
                </div>
                <div class="form-group">
                    <label class="form-label" for="wizard-link-id">Existing Links</label>
                    <select class="form-select" id="wizard-link-id">
                        <option value="">— Select a saved link —</option>
                        ${links.map(l => `<option value="${escapeHTML(l.id)}">${escapeHTML(l.icon)} ${escapeHTML(l.title)}</option>`).join('')}
                    </select>
                </div>
                <div style="text-align: center; margin: var(--space-md) 0; position: relative;">
                    <hr style="border: none; border-top: 1px solid var(--border-color);">
                    <span style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); background: var(--bg-surface-elevated); padding: 0 10px; font-size: 0.75rem; color: var(--text-muted);">OR</span>
                </div>
                <button class="btn btn-secondary w-full" id="wiz-create-new-btn">
                    <span>➕</span> Create New External Link
                </button>
            `,
            submitLabel: 'Next: Choose Tag',
            onSubmit: () => {
                const linkId = document.getElementById('wizard-link-id').value;
                if (!linkId) {
                    showToast('Please select a link or create one', 'warning');
                    return;
                }
                showStep2(linkId);
            }
        });

        document.getElementById('wiz-create-new-btn')?.addEventListener('click', () => {
            showCreateLinkInWizard();
        });
    };

    const showCreateLinkInWizard = () => {
        openModal({
            title: 'Create Link',
            content: `
                <div class="form-group">
                    <label class="form-label" for="wiz-link-title">Title</label>
                    <input class="form-input" id="wiz-link-title" placeholder="e.g. My Website">
                </div>
                <div class="form-group">
                    <label class="form-label" for="wiz-link-url">Destination URL</label>
                    <input class="form-input" id="wiz-link-url" type="url" placeholder="https://...">
                </div>
            `,
            submitLabel: 'Create & Continue',
            onSubmit: () => {
                const title = document.getElementById('wiz-link-title').value;
                const url = document.getElementById('wiz-link-url').value;
                if (!title || !url) return;
                
                const newLink = store.createLink({ title, url, category: 'general' });
                showStep2(newLink.id);
            }
        });
    };

    // STEP 2: Tag Selection
    const showStep2 = (linkId) => {
        const tags = store.tags;
        openModal({
            title: '📡 Write Wizard: Step 2',
            content: `
                <p style="margin-bottom: var(--space-md); color: var(--text-secondary);">Assign this link to a registered tag for tracking, or write it directly.</p>
                <div class="form-group">
                    <label class="form-label" for="wizard-tag-id">Available Tags</label>
                    <select class="form-select" id="wizard-tag-id">
                        <option value="">— Write Generic / Guest Tag —</option>
                        ${tags.map(t => `<option value="${t.id}">${escapeHTML(t.label)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-top: var(--space-md)">
                    <label class="checkbox-container" for="wiz-lock" style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer;">
                        <input type="checkbox" id="wiz-lock">
                        <span style="font-size: var(--font-size-sm);"><strong>Lock Tag</strong> (Anti-overwrite)</span>
                    </label>
                    <p class="text-xs text-muted">A locked tag can never be rewritten again.</p>
                </div>
            `,
            submitLabel: 'Ready to Program',
            onSubmit: () => {
                const tagId = document.getElementById('wizard-tag-id').value;
                const lock = document.getElementById('wiz-lock').checked;
                showStep3(linkId, tagId, lock);
            }
        });
    };

    // STEP 3: Writing Activation
    const showStep3 = (linkId, tagId, lock) => {
        const link = store.getLink(linkId);
        const compat = store.nfcCompat;
        
        // Final URL Logic: Admin ALWAYS writes a redirect link if a Tag ID is selected
        let finalUrl = link.url;
        if (tagId) {
            finalUrl = `${window.location.origin}/#/r/${tagId}`;
        }

        if (compat.platform === 'ios-web') {
            openModal({
                title: '🍎 iPhone: Writing Guide',
                content: `
                    <div style="text-align: center; padding: var(--space-md);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📲</div>
                        <h3>Writing to NFC on iPhone</h3>
                        <p style="color: var(--text-secondary); margin-bottom: var(--space-md); font-size: 0.9rem;">
                            Web browsers on iOS cannot write to tags directly. Follow these simple steps:
                        </p>
                        
                        <div style="text-align: left; background: var(--bg-surface-elevated); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-lg); border: 1px solid var(--border-color);">
                            <ol style="padding-left: 1.25rem; font-size: 0.85rem; line-height: 1.6; color: var(--text-primary);">
                                <li>Copy the <strong>Target URL</strong> below.</li>
                                <li>Download/Open <a href="https://apps.apple.com/app/nfc-tools/id1252962749" target="_blank" style="color: var(--color-primary); font-weight: 600;">NFC Tools</a> from the App Store.</li>
                                <li>In NFC Tools: Tap <strong>Write</strong> → <strong>Add a record</strong> → <strong>URL/URI</strong>.</li>
                                <li><strong>Paste</strong> the URL and tap <strong>OK</strong> → <strong>Write</strong>.</li>
                            </ol>
                        </div>

                        <div class="form-group">
                            <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Target URL to Copy</label>
                            <div style="background: var(--bg-surface); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.8rem; word-break: break-all; border: 1px solid var(--border-color); color: var(--text-primary);">
                                ${escapeHTML(finalUrl)}
                            </div>
                        </div>
                    </div>
                `,
                submitLabel: '📋 Copy URL & Finish',
                onSubmit: async () => {
                    try {
                        await navigator.clipboard.writeText(finalUrl);
                        showToast('URL Copied to clipboard!', 'success');
                        closeModal();
                    } catch (e) {
                         showToast('Failed to copy. Please manually select and copy.', 'error');
                    }
                }
            });
        } else {
            openModal({
                title: '📡 Write Wizard: Writing...',
                content: `
                    <div class="nfc-tap-target active" style="margin: var(--space-lg) 0;">
                        <div class="nfc-tap-icon-wrap">
                            <div class="nfc-tap-icon">📲</div>
                            <div class="nfc-ring"></div>
                            <div class="nfc-ring"></div>
                        </div>
                        <p class="nfc-tap-label"><strong>Hold Tag Against Phone</strong><br>Keep it there until done</p>
                    </div>
                `,
                submitLabel: 'Cancel',
                onSubmit: () => {
                    closeModal();
                }
            });

            // Start hardware interaction
            nfc.writeTag(finalUrl, { lock }).then(() => {
                if (tagId) store.assignLinkToTag(tagId, linkId);
                showToast('Tag Written Successfully!', 'success');
                openModal({
                    title: '✅ Success',
                    content: `
                        <div style="text-align: center; padding: var(--space-lg);">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                            <h3>Tag Programmed!</h3>
                            <p style="color: var(--text-secondary);">Your NFC tag is now live and ready to use.</p>
                        </div>
                    `,
                    submitLabel: 'Amazing!',
                    onSubmit: () => closeModal()
                });
            }).catch(err => {
                showToast(`Write error: ${err.message}`, 'error');
            });
        }
    };

    showStep1();
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

registerRoute('', () => {
  if (store.isAuthenticated) {
    navigate('/dashboard');
  } else {
    navigate('/login');
  }
});

registerRoute('/dashboard', authGuard(renderDashboard));
registerRoute('/links', authGuard(renderLinks));
registerRoute('/tags', authGuard(renderTags));
registerRoute('/writer', authGuard(renderWriter));
registerRoute('/settings', authGuard(renderSettings));
registerRoute('/analytics', premiumGuard(renderAnalytics));
registerRoute('/templates', premiumGuard(renderTemplates));
registerRoute('/profile', authGuard(renderProfile));
registerRoute('/admin', adminGuard(renderAdmin));
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
  // Ensure nfcCompat is updated on boot
  if (!store.nfcCompat || store.nfcCompat.platform === 'loading') {
      try {
          await store.refreshNfcCompat();
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
  
  // Apply initial theme
  document.documentElement.setAttribute('data-theme', store.settings.theme);
  store.subscribe((state) => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  });

  startRouter();
}).catch(err => {
    console.error('App boot failure:', err);
    const appEl = document.getElementById('app');
    appEl.innerHTML = `<div style="padding: 2rem; color: white;">Critical Error: <span></span></div>`;
    appEl.querySelector('span').textContent = err.message;
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
