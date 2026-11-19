import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { escapeHTML, isValidUrl } from '../utils/sanitize.js';
import { open2FASetupModal, open2FADisableModal } from '../components/two-factor-dialog.js';

export function renderProfile() {
    const container = document.getElementById('page-content');
    if (!container) return;

    const user = store.user;
    const sub = store.subscription;
    const isPro = store.isPremium();
    const is2FAEnabled = store.is2FAEnabled;
    const security2FA = store.security2FA;
    const remainingBackupCount = Array.isArray(security2FA?.backupCodes)
        ? security2FA.backupCodes.length
        : 0;
    const trialEnds = sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : null;
    const t = (key) => store.t(key);

    const planBadgeLabel = sub.tier === 'pro'
        ? 'Professional'
        : (trialEnds && isPro)
            ? t('pro_trial')
            : isPro
                ? 'Pro Access'
                : t('free_tier');

    const planRenewalText = sub.tier === 'pro'
        ? 'Renews on next billing cycle'
        : trialEnds
            ? `Trial ends on <strong>${escapeHTML(trialEnds)}</strong>`
            : 'Full Pro access enabled';

    container.innerHTML = `
        ${renderHeader(t('profile'), t('profile_sub'))}

        <div class="page-container animate-fade-in">
            <div class="grid grid-2">
                <!-- User Profile Card -->
                <div class="card-glass">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <h3 class="card-title">${t('user_account')}</h3>
                        <span class="badge ${is2FAEnabled ? 'badge-success' : 'badge-warning'}">
                            ${is2FAEnabled ? '● 2FA Active' : '2FA Not Configured'}
                        </span>
                    </div>
                    <div class="profile-info">
                        <div class="profile-avatar">
                            ${user?.photoURL && isValidUrl(user.photoURL) ? `<img src="${escapeHTML(user.photoURL)}" alt="Avatar">` : `<div class="avatar-placeholder">${escapeHTML(user?.displayName?.[0] || 'U')}</div>`}
                        </div>
                        <div class="profile-details">
                            <div class="profile-name">${escapeHTML(user?.displayName || 'Tocaito User')}</div>
                            <div class="profile-email">${escapeHTML(user?.email || 'authenticated via device')}</div>
                            <div style="font-size: 0.76rem; color: var(--color-primary); margin-top: 4px; font-weight: 600;">
                                Signed in with Google Account
                            </div>
                        </div>
                    </div>

                    <!-- Two-Factor Authentication Box -->
                    <div style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius-md, 12px); background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 6px;">
                            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">Two-Factor Authentication (2FA)</span>
                            <span style="font-size: 0.74rem; font-weight: 600; color: ${is2FAEnabled ? 'var(--color-primary, #10b981)' : '#f59e0b'};">
                                ${is2FAEnabled ? `${remainingBackupCount} backup codes left` : 'Recommended for Google accounts'}
                            </span>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 1rem;">
                            ${is2FAEnabled
                                ? 'Your Google account is protected with free RFC 6238 TOTP (Google Authenticator, Apple Passwords, Authy, 1Password).'
                                : 'Add free 2FA to your Google account with zero SMS fees. A 6-digit authenticator code will be required when signing in.'}
                        </p>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${is2FAEnabled ? `
                                <button type="button" class="btn btn-secondary btn-sm" id="profile-reconfigure-2fa-btn">
                                    🔄 Re-enable / New Key
                                </button>
                                <button type="button" class="btn btn-danger btn-sm" id="profile-disable-2fa-btn">
                                    Disable 2FA
                                </button>
                            ` : `
                                <button type="button" class="btn btn-primary btn-sm" id="profile-enable-2fa-btn">
                                    🛡️ Enable Free 2FA for Google Account
                                </button>
                            `}
                        </div>
                    </div>

                    <div class="card-actions" style="margin-top: 1.5rem">
                        <button class="btn btn-secondary btn-sm" id="logout-btn">${t('logout')}</button>
                    </div>
                </div>

                <!-- Subscription Status Card -->
                <div class="card-glass ${isPro ? 'card-pro' : ''}">
                    <div class="card-header">
                        <h3 class="card-title">${t('current_plan')}</h3>
                        <span class="badge ${isPro ? 'badge-primary' : 'badge-secondary'}">
                            ${escapeHTML(planBadgeLabel)}
                        </span>
                    </div>
                    
                    <div class="subscription-card-body">
                        ${!isPro ? `
                            <p class="text-secondary">${t('free_desc')}</p>
                            <ul class="plan-features">
                                <li class="feat-disabled">Analytics Dashboard</li>
                                <li class="feat-disabled">Business Templates</li>
                                <li class="feat-disabled">Geo-tagging & Locking</li>
                                <li>Max 3 NFC Tags</li>
                            </ul>
                            <div class="card-actions" style="margin-top: 1.5rem">
                                <button class="btn btn-primary w-full" id="upgrade-btn">${t('upgrade_pro')}</button>
                                ${!sub.trialStartedAt ? `
                                    <button class="btn btn-secondary w-full" id="start-trial-btn" style="margin-top: 0.5rem">${t('start_trial')}</button>
                                ` : ''}
                            </div>
                        ` : `
                            <p class="text-secondary">${t('pro_desc')}</p>
                            <ul class="plan-features">
                                <li class="feat-enabled">Advanced Analytics</li>
                                <li class="feat-enabled">Industry Templates</li>
                                <li class="feat-enabled">Unlimited Tags</li>
                                <li class="feat-enabled">Biometric Security</li>
                            </ul>
                            <p class="text-sm text-muted" style="margin-top: 1rem">
                                ${planRenewalText}
                            </p>
                            <div class="card-actions" style="margin-top: 1.5rem">
                                <button class="btn btn-secondary w-full" id="manage-sub-btn">Manage Subscription (Stripe)</button>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Refer a Friend Card -->
                <div class="card-glass" style="grid-column: 1 / -1;">
                    <div class="card-header">
                        <h3 class="card-title">🎁 ${t('refer_friend')}</h3>
                    </div>
                    <div class="subscription-card-body">
                        <p class="text-secondary" style="margin-bottom: 1rem;">
                            ${t('refer_desc')}
                        </p>
                        <div class="form-group" style="display: flex; gap: var(--space-sm);">
                            <input class="form-input" style="flex:1;" type="text" readonly id="referralLink" value="https://nfc-manager-fv96.web.app/?ref=${escapeHTML(user?.id || 'early-tester')}">
                            <button class="btn btn-primary" id="copyReferralBtn">${t('copy_link')}</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Plan Comparison Table -->
            <div class="card-glass" style="margin-top: 2rem">
                <div class="card-header">
                    <h3 class="card-title">${t('plan_comparison')}</h3>
                </div>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>NFC Tag Management</td>
                            <td>3 Tags</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <td>Dynamic Redirection</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Analytics & CSV</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Business Templates</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Tag Locking (Security)</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Geo-tagging Assets</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Events
    container.querySelector('#logout-btn')?.addEventListener('click', async () => {
        await store.logout();
        navigate('/login');
    });

    container.querySelector('#profile-enable-2fa-btn')?.addEventListener('click', () => {
        open2FASetupModal(() => renderProfile());
    });

    container.querySelector('#profile-reconfigure-2fa-btn')?.addEventListener('click', () => {
        open2FASetupModal(() => renderProfile());
    });

    container.querySelector('#profile-disable-2fa-btn')?.addEventListener('click', () => {
        open2FADisableModal(() => renderProfile());
    });

    container.querySelector('#start-trial-btn')?.addEventListener('click', () => {
        store.startTrial();
        showToast('Premium trial started! Enjoy all features.', 'success');
        renderProfile();
    });

    container.querySelector('#upgrade-btn')?.addEventListener('click', () => {
        showToast('Stripe Checkout integration placeholder...', 'info');
        setTimeout(() => {
            store.upgrade();
            showToast('Welcome to Pro! Plan activated.', 'success');
            renderProfile();
        }, 1500);
    });

    container.querySelector('#copyReferralBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('referralLink');
        if (input) {
            try {
                await navigator.clipboard.writeText(input.value);
                showToast('Referral link copied to clipboard!', 'success');
            } catch (err) {
                input.select();
                document.execCommand('copy');
                showToast('Referral link copied to clipboard!', 'success');
            }
        }
    });
}
