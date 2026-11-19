/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Login View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';
import { prompt2FALogin } from '../components/two-factor-dialog.js';

function navigatePostLogin() {
    const pendingTagId = typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('pending_tag_activation')
        : null;
    if (pendingTagId) {
        sessionStorage.removeItem('pending_tag_activation');
        navigate(`/r/${pendingTagId}`);
        return;
    }
    navigate('/dashboard');
}

export function renderLogin() {
    const app = document.getElementById('app');
    if (!app) return;
    app.removeAttribute('aria-busy');

    const t = (key) => store.t(key);

    app.innerHTML = `
    <div class="login-page">
      <div class="login-card card-glass animate-scale-in" style="max-width: 400px; padding: 3rem;">
        <div class="login-logo-wrap" style="text-align: center; margin-bottom: 2rem;">
          <img src="/logo.png" alt="NFC Tag Manager Logo" style="width: 120px; height: 120px; border-radius: 24px; box-shadow: var(--shadow-xl);">
        </div>
        
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <h1 class="login-title" style="font-size: 2.5rem; margin-bottom: 0.5rem; letter-spacing: -0.04em; font-weight: 800;">Tocaito</h1>
          <p class="login-subtitle" style="opacity: 0.7; font-size: 0.95rem;">${t('login_subtitle')}</p>
        </div>

        <div class="login-actions">
            <button class="btn btn-primary btn-lg w-full" id="googleLoginBtn" style="height: 56px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 600; font-size: 1.05rem; box-shadow: var(--shadow-lg);">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="20" height="20" style="filter: brightness(0) invert(1);">
              ${t('sign_in_google')}
            </button>
        </div>

        <div style="margin-top: 3rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
          <p class="login-hint" style="font-size: 0.85rem; opacity: 0.5;">${t('login_hint')}</p>
        </div>
      </div>
    </div>
  `;

    // Google Login
    document.getElementById('googleLoginBtn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const originalHtml = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="border-top-color: currentColor;"></span> Signing in...';

        try {
            if (await store.loginWithGoogle()) {
                if (store.is2FAEnabled && !store.isSession2FAVerified()) {
                    prompt2FALogin(
                        () => {
                            showToast('Welcome back!', 'success');
                            navigatePostLogin();
                        },
                        async () => {
                            await store.logout();
                            showToast('Sign-in cancelled.', 'info');
                        }
                    );
                } else {
                    showToast('Welcome back!', 'success');
                    navigatePostLogin();
                }
            }
        } catch (error) {
            showToast('Sign-In failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    });
}
