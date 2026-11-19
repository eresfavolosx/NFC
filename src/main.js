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
import { showToast } from './components/toast.js';
import { escapeHTML } from './utils/sanitize.js';
import { openModal, closeModal } from './components/modal.js';
import { prompt2FALogin } from './components/two-factor-dialog.js';

function applyTheme(theme = 'system') {
  const normalized = ['light', 'dark', 'system'].includes(theme) ? theme : 'system';
  document.documentElement.setAttribute('data-theme', normalized);
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', normalized === 'system' ? 'light dark' : normalized);
  }
}

// ── Authentication & 2FA Verification Helper ──
function verifyAuthAnd2FA(onVerified) {
  if (!store.isAuthenticated) {
    navigate('/login');
    return false;
  }
  if (store.is2FAEnabled && !store.isSession2FAVerified()) {
    prompt2FALogin(
      () => onVerified(),
      async () => {
        await store.logout();
        navigate('/login');
      }
    );
    return false;
  }
  return true;
}

// ── Guard: redirect to login if not authenticated or 2FA unverified ──
function authGuard(renderFn) {
  return () => {
    if (verifyAuthAnd2FA(() => {
      ensureAppLayout();
      updateSidebarActive(getCurrentRoute());
      return renderFn();
    })) {
      ensureAppLayout();
      updateSidebarActive(getCurrentRoute());
      return renderFn();
    }
  };
}

function premiumGuard(renderFn) {
  return () => {
    if (verifyAuthAnd2FA(() => {
      if (!store.isPremium()) {
        navigate('/profile');
        showToast('Premium feature. Start your trial or upgrade to access!', 'warning');
        return;
      }
      ensureAppLayout();
      updateSidebarActive(getCurrentRoute());
      return renderFn();
    })) {
      if (!store.isPremium()) {
        navigate('/profile');
        showToast('Premium feature. Start your trial or upgrade to access!', 'warning');
        return;
      }
      ensureAppLayout();
      updateSidebarActive(getCurrentRoute());
      return renderFn();
    }
  };
}

function adminGuard(renderFn) {
  return () => {
    if (verifyAuthAnd2FA(() => {
      if (!store.isSuperAdmin()) {
        navigate('/dashboard');
        showToast('Access Denied: Super Admin only.', 'error');
        return;
      }
      ensureAppLayout();
      updateSidebarActive(getCurrentRoute());
      return renderFn();
    })) {
      if (!store.isSuperAdmin()) {
        navigate('/dashboard');
        showToast('Access Denied: Super Admin only.', 'error');
        return;
      }
      ensureAppLayout();
      updateSidebarActive(getCurrentRoute());
      return renderFn();
    }
  };
}

// ── Ensure the sidebar + main layout is present ──
function ensureAppLayout() {
  const app = document.getElementById('app');
  app?.removeAttribute('aria-busy');
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
                        ${links.map(l => `<option value="${escapeHTML(l.id)}">${escapeHTML(l.icon || '🔗')} ${escapeHTML(l.title)}</option>`).join('')}
                    </select>
                </div>
                <div style="text-align: center; margin: var(--space-md) 0; position: relative;">
                    <hr style="border: none; border-top: 1px solid var(--border-color);">
                    <span style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); background: var(--bg-surface-elevated); padding: 0 10px; font-size: 0.75rem; color: var(--text-muted);">OR</span>
                </div>
                <button type="button" class="btn btn-secondary w-full" id="wiz-create-new-btn">
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

                try {
                    const newLink = store.createLink({ title, url, category: 'general' });
                    showStep2(newLink.id);
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        });
    };

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
                        ${tags.map(t => `<option value="${escapeHTML(t.id)}">${escapeHTML(t.label)}</option>`).join('')}
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

    const showStep3 = (linkId, tagId, lock) => {
        const link = store.getLink(linkId);
        if (!link) return;
        const compat = store.nfcCompat;

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
                                <li>Download/Open <a href="https://apps.apple.com/app/nfc-tools/id1252962749" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); font-weight: 600;">NFC Tools</a> from the App Store.</li>
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

            nfc.writeTag(finalUrl, { lock }).then(() => {
                if (tagId) {
                    store.assignLinkToTag(tagId, linkId);
                    if (lock) store.updateTag(tagId, { isLocked: true });
                }
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

function redirectIfAuthenticated() {
  if (store.isAuthenticated && (!store.is2FAEnabled || store.isSession2FAVerified())) {
    const pendingTagId = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('pending_tag_activation')
      : null;
    if (pendingTagId) {
      sessionStorage.removeItem('pending_tag_activation');
      navigate(`/r/${pendingTagId}`);
      return true;
    }
    navigate('/dashboard');
    return true;
  }
  return false;
}

// ── Register Routes ──
registerRoute('/login', () => {
  if (redirectIfAuthenticated()) return;
  const app = document.getElementById('app');
  app.classList.remove('app-layout');
  return renderLogin();
});

registerRoute('', () => {
  if (!redirectIfAuthenticated()) {
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

function renderBiometricGate(onUnlocked) {
  const appEl = document.getElementById('app');
  if (!appEl) return;
  appEl.removeAttribute('aria-busy');
  appEl.classList.remove('app-layout');
  appEl.innerHTML = `
    <div class="login-page">
      <div class="login-card card-glass animate-scale-in" style="max-width: 400px; padding: 2.5rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
        <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Authentication Required</h1>
        <p style="color: var(--text-secondary); margin-bottom: 1.75rem; font-size: 0.9rem;">
          Verify with FaceID/TouchID or sign out to re-authenticate.
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button type="button" class="btn btn-primary w-full" id="biometricRetryBtn">Unlock with Biometrics</button>
          <button type="button" class="btn btn-secondary w-full" id="biometricSignOutBtn">Sign Out</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('biometricRetryBtn')?.addEventListener('click', async () => {
    try {
      const ok = await nfc.authenticateWithBiometrics();
      if (ok) {
        onUnlocked();
      } else {
        showToast('Biometric authentication failed. Please try again.', 'error');
      }
    } catch {
      showToast('Biometric authentication failed. Please try again.', 'error');
    }
  });

  document.getElementById('biometricSignOutBtn')?.addEventListener('click', async () => {
    await store.logout();
    navigate('/login');
    onUnlocked();
  });
}

// ── Boot ──
export async function bootApp() {
  try {
    await store.init();
    if (!store.nfcCompat || store.nfcCompat.platform === 'loading') {
      try {
        await store.refreshNfcCompat();
      } catch (e) {
        console.error('Failed to get compatibility info:', e);
      }
    }

    applyTheme(store.settings.theme);
    if (store.settings.brandName) {
      document.title = store.settings.brandName;
    }

    // Wait for Firebase Auth initial state before routing
    await store.waitForAuthReady();

    let wasAuthenticated = store.isAuthenticated;
    store.subscribe((state) => {
      applyTheme(state.settings.theme);
      if (state.settings.brandName) {
        document.title = state.settings.brandName;
      }

      const isNowAuthenticated = Boolean(state.settings.user);
      if (wasAuthenticated && !isNowAuthenticated) {
        const currentRoute = getCurrentRoute() || '/';
        const normalized = currentRoute.startsWith('/') ? currentRoute : `/${currentRoute}`;
        if (normalized !== '/login' && normalized !== '/404' && !normalized.startsWith('/r/')) {
          closeModal(true);
          navigate('/login');
        }
      }
      wasAuthenticated = isNowAuthenticated;
    });

    const settings = store.settings;
    if (settings.useBiometrics && nfc.isNative()) {
      let biometricPassed = false;
      try {
        const available = await nfc.isBiometricAvailable();
        if (!available) {
          biometricPassed = true;
        } else {
          biometricPassed = await nfc.authenticateWithBiometrics();
        }
      } catch (e) {
        console.error('Biometric check error:', e);
        biometricPassed = false;
      }

      if (!biometricPassed) {
        renderBiometricGate(() => startRouter());
        return;
      }
    }

    startRouter();
  } catch (err) {
    console.error('App boot failure:', err);
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.removeAttribute('aria-busy');
      appEl.innerHTML = `<div style="padding: 2rem; color: white;">Critical Error: <span></span></div>`;
      appEl.querySelector('span').textContent = err.message;
    }
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  bootApp();

  // ── PWA: Register Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration is optional
      });
    });
  }
}
