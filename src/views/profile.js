import { store } from '../store.js';
import { renderHeader, escapeHTML, showToast } from '../main.js';

export function renderProfile() {
    const container = document.getElementById('page-content');
    if (!container) return;

    const user = store.user;
    const sub = store.subscription;
    const isPro = store.isPremium();
    const trialEnds = sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : null;

    container.innerHTML = `
        ${renderHeader('Profile & Subscription', 'Manage your account and plan')}

        <div class="page-container animate-fade-in">
            <div class="grid grid-2">
                <!-- User Profile Card -->
                <div class="card-glass">
                    <div class="card-header">
                        <h3 class="card-title">User Account</h3>
                    </div>
                    <div class="profile-info">
                        <div class="profile-avatar">
                            ${user?.photoURL ? `<img src="${user.photoURL}" alt="Avatar">` : `<div class="avatar-placeholder">${user?.displayName?.[0] || 'U'}</div>`}
                        </div>
                        <div class="profile-details">
                            <div class="profile-name">${escapeHTML(user?.displayName || 'NFC Manager User')}</div>
                            <div class="profile-email">${escapeHTML(user?.email || 'authenticated via device')}</div>
                        </div>
                    </div>
                    <div class="card-actions" style="margin-top: 2rem">
                        <button class="btn btn-secondary btn-sm" id="logout-btn">Sign Out</button>
                    </div>
                </div>

                <!-- Subscription Status Card -->
                <div class="card-glass ${isPro ? 'card-pro' : ''}">
                    <div class="card-header">
                        <h3 class="card-title">Current Plan</h3>
                        <span class="badge ${isPro ? 'badge-primary' : 'badge-secondary'}">
                            ${sub.tier === 'pro' ? 'Professional' : sub.trialEndsAt && isPro ? 'Pro Trial' : 'Free Tier'}
                        </span>
                    </div>
                    
                    <div class="subscription-card-body">
                        ${!isPro ? `
                            <p class="text-secondary">You are currently on the limited free plan.</p>
                            <ul class="plan-features">
                                <li class="feat-disabled">Analytics Dashboard</li>
                                <li class="feat-disabled">Business Templates</li>
                                <li class="feat-disabled">Geo-tagging & Locking</li>
                                <li>Max 3 NFC Tags</li>
                            </ul>
                            <div class="card-actions" style="margin-top: 1.5rem">
                                <button class="btn btn-primary w-full" id="upgrade-btn">Upgrade to Pro ($9.99/mo)</button>
                                ${!sub.trialStartedAt ? `
                                    <button class="btn btn-secondary w-full" id="start-trial-btn" style="margin-top: 0.5rem">Start 14-day Free Trial</button>
                                ` : ''}
                            </div>
                        ` : `
                            <p class="text-secondary">You have access to all premium features.</p>
                            <ul class="plan-features">
                                <li class="feat-enabled">Advanced Analytics</li>
                                <li class="feat-enabled">Industry Templates</li>
                                <li class="feat-enabled">Unlimited Tags</li>
                                <li class="feat-enabled">Biometric Security</li>
                            </ul>
                            <p class="text-sm text-muted" style="margin-top: 1rem">
                                ${sub.tier === 'pro' ? 'Renews on next billing cycle' : `Trial ends on <strong>${trialEnds}</strong>`}
                            </p>
                            <div class="card-actions" style="margin-top: 1.5rem">
                                <button class="btn btn-secondary w-full" id="manage-sub-btn">Manage Subscription (Stripe)</button>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Plan Comparison Table -->
            <div class="card-glass" style="margin-top: 2rem">
                <div class="card-header">
                    <h3 class="card-title">Plan Comparison</h3>
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
    container.querySelector('#logout-btn')?.addEventListener('click', () => {
        store.logout().then(() => {
            window.location.hash = '/login';
        });
    });

    container.querySelector('#start-trial-btn')?.addEventListener('click', () => {
        store.startTrial();
        showToast('Premium trial started! Enjoy all features.', 'success');
        renderProfile();
    });

    container.querySelector('#upgrade-btn')?.addEventListener('click', () => {
        // Placeholder for Stripe
        showToast('Stripe Checkout integration placeholder...', 'info');
        setTimeout(() => {
            store.upgrade();
            showToast('Welcome to Pro! Plan activated.', 'success');
            renderProfile();
        }, 1500);
    });
}
