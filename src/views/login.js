/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Login View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="login-page">
      <div class="login-card card-glass animate-scale-in" style="max-width: 400px; padding: 3rem;">
        <div class="login-logo-wrap" style="text-align: center; margin-bottom: 2rem;">
          <img src="/logo.png" alt="NFC Tag Manager Logo" style="width: 120px; height: 120px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
        </div>
        
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <h1 class="login-title" style="font-size: 2.5rem; margin-bottom: 0.5rem; letter-spacing: -0.04em; font-weight: 800;">Tocaito</h1>
          <p class="login-subtitle" style="opacity: 0.7; font-size: 0.95rem;">Professional NFC Tag Management</p>
        </div>

        <div class="login-actions">
            <button class="btn btn-primary btn-lg w-full" id="googleLoginBtn" style="height: 56px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 600; font-size: 1.05rem; box-shadow: var(--shadow-lg);">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="20" height="20" style="filter: brightness(0) invert(1);">
              Sign in with Google
            </button>
        </div>

        <div style="margin-top: 3rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
          <p class="login-hint" style="font-size: 0.85rem; opacity: 0.5;">Secure Cloud Management for Restaurant Tags</p>
        </div>
      </div>
    </div>
  `;

    // Google Login
    document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
        try {
            if (await store.loginWithGoogle()) {
                showToast('Welcome back!', 'success');
                navigate('/dashboard');
            }
        } catch (error) {
            showToast('Sign-In failed. Please try again.', 'error');
        }
    });
}
