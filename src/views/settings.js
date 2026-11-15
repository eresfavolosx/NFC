/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Settings View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { escapeHTML } from '../utils/sanitize.js';
import { open2FASetupModal } from '../components/two-factor-dialog.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderSettings() {
    const container = document.getElementById('page-content');
    const settings = store.settings;
    const is2FAEnabled = store.is2FAEnabled;
    const security2FA = store.security2FA;
    const enabledDate = security2FA?.enabledAt
        ? new Date(security2FA.enabledAt).toLocaleDateString()
        : null;
    const remainingBackupCount = Array.isArray(security2FA?.backupCodes)
        ? security2FA.backupCodes.length
        : 0;

    container.innerHTML = `
    ${renderHeader('Settings', 'Configure your NFC management environment')}

    <div class="page-container">
      <div class="card animate-fade-up">
        <div class="card-header">
          <h2 class="card-title">General Settings</h2>
        </div>
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label" for="brandName">Brand Name</label>
            <input class="form-input" type="text" id="brandName" value="${escapeHTML(settings.brandName || '')}" placeholder="e.g. My Awesome Brand">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="themeSelect">Theme</label>
            <select class="form-select" id="themeSelect">
              <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>System Default</option>
              <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
              <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
            </select>
          </div>
          
          <div class="settings-divider"></div>

          <div>
            <div class="form-group">
              <label class="form-label" for="restaurantName">Restaurant Name</label>
              <input class="form-input" type="text" id="restaurantName" value="${escapeHTML(settings.restaurantName || '')}" placeholder="e.g. La Trattoria">
            </div>
          </div>

          <div class="settings-divider"></div>

          <div class="form-group-row">
            <div class="form-info">
              <label class="form-label" for="useBiometrics">Biometric Authentication</label>
              <p class="form-desc" id="biometricsDesc">Use FaceID or TouchID to unlock administrative settings.</p>
            </div>
            <label class="switch">
              <input type="checkbox" id="useBiometrics" aria-describedby="biometricsDesc" ${settings.useBiometrics ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>



          <div class="settings-actions">
            <button class="btn btn-primary" id="saveSettingsBtn">Save Changes</button>
          </div>
        </div>
      </div>

      <div class="card animate-fade-up" style="margin-top: 1.5rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <h2 class="card-title">Two-Factor Authentication (2FA)</h2>
          <span class="badge ${is2FAEnabled ? 'badge-success' : 'badge-warning'}">
            ${is2FAEnabled ? '● Active & Protected (RFC 6238)' : 'Not Configured'}
          </span>
        </div>
        <div class="settings-form">
          <p class="form-desc" style="margin-bottom: 1rem;">
            Add an extra layer of account security using Time-Based One-Time Passwords (RFC 6238 TOTP). Compatible with Google Authenticator, Apple Passwords, Authy, and 1Password — 100% free with zero SMS fees.
          </p>

          ${is2FAEnabled ? `
            <div style="display: flex; flex-wrap: wrap; gap: 1.25rem; margin-bottom: 1.25rem; font-size: 0.9rem; opacity: 0.9;">
              ${enabledDate ? `<div><strong>Activated:</strong> ${escapeHTML(enabledDate)}</div>` : ''}
              <div><strong>Remaining Backup Codes:</strong> ${remainingBackupCount}</div>
            </div>
            <div class="settings-actions" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary" id="reconfigure2faBtn">Reconfigure / Re-enable on New Device</button>
              <button type="button" class="btn btn-danger" id="disable2faBtn">Disable 2FA</button>
            </div>
          ` : `
            <p class="form-desc" style="margin-bottom: 1.25rem;">
              Protect your NFC tags, redirects, and account even if your primary login session is compromised. You can enable, disable, or re-enable 2FA with fresh keys at any time.
            </p>
            <div class="settings-actions">
              <button type="button" class="btn btn-primary" id="enable2faBtn">Enable Two-Factor Authentication</button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

    initSettingsEvents();
}

function initSettingsEvents() {
    const restaurantSettings = document.getElementById('restaurantSettings');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const enable2faBtn = document.getElementById('enable2faBtn');
    const reconfigure2faBtn = document.getElementById('reconfigure2faBtn');
    const disable2faBtn = document.getElementById('disable2faBtn');

    enable2faBtn?.addEventListener('click', () => {
        open2FASetupModal(() => renderSettings());
    });

    reconfigure2faBtn?.addEventListener('click', () => {
        open2FASetupModal(() => renderSettings());
    });

    disable2faBtn?.addEventListener('click', () => {
        openModal({
            title: 'Disable Two-Factor Authentication?',
            content: '<p>Are you sure you want to disable 2FA? Your account will only be protected by your Google sign-in credentials. You can re-enable 2FA anytime.</p>',
            submitLabel: 'Yes, Disable 2FA',
            showCancel: true,
            onSubmit: (e) => {
                e?.preventDefault();
                store.disable2FA();
                closeModal();
                showToast('Two-factor authentication disabled.', 'info');
                renderSettings();
            }
        });
    });

    saveBtn?.addEventListener('click', () => {
        const brandName = document.getElementById('brandName').value;
        const restaurantName = document.getElementById('restaurantName').value;
        const useBiometrics = document.getElementById('useBiometrics').checked;
        const theme = document.getElementById('themeSelect').value;

        store.updateSettings({
            brandName,
            restaurantName,
            useBiometrics,
            theme
        });

        showToast('Settings saved successfully!', 'success');
        
        // Update document title if brand name changed
        if (brandName) {
            document.title = brandName;
        }
    });
}
