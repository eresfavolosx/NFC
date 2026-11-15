/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Free RFC 6238 2FA Dialogs
   ═══════════════════════════════════════════════════════════ */

import QRCode from 'qrcode';
import { store } from '../store.js';
import { openModal, closeModal } from './modal.js';
import { showToast } from './toast.js';
import {
    generateTotpSecret,
    buildOtpAuthUri,
    verifyTotpCode,
    generateBackupCodes,
    verifyAndConsumeBackupCode,
    getTotpSecondsRemaining
} from '../utils/totp.js';

/**
 * Prompt the user for their 6-digit Authenticator code (or backup code) upon login.
 */
export function prompt2FALogin(onSuccess, onCancel) {
    let isBackupMode = false;
    let timer = null;

    const renderBody = () => {
        const sec = getTotpSecondsRemaining();
        if (isBackupMode) {
            return `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">🛡️</div>
                <h4 style="margin: 0 0 6px 0; font-size: 1.15rem;">Emergency Backup Code</h4>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.7;">Enter one of your 8-character single-use recovery codes.</p>
            </div>
            <div class="form-group">
                <input class="form-input" id="nfc2faInput" type="text" placeholder="e.g. ABCD-1234" autofocus style="text-align: center; font-family: monospace; font-size: 1.2rem; letter-spacing: 0.15em; text-transform: uppercase;">
            </div>
            <div id="nfc2faError" style="color: #ef4444; font-size: 0.82rem; margin-top: 8px; text-align: center; display: none;"></div>
            <div style="text-align: center; margin-top: 1rem;">
                <button type="button" id="toggle2faModeBtn" class="btn-ghost" style="font-size: 0.8rem; text-decoration: underline;">Use 6-digit Authenticator code</button>
            </div>
            `;
        }

        return `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(16, 185, 129, 0.15); color: #10b981; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">🔒</div>
            <h4 style="margin: 0 0 6px 0; font-size: 1.15rem;">Two-Factor Authentication</h4>
            <p style="margin: 0; font-size: 0.85rem; opacity: 0.7;">Enter the 6-digit code from Google Authenticator, Apple Passwords, Authy, or 1Password.</p>
        </div>
        <div class="form-group">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px; opacity: 0.8;">
                <span>6-Digit Code</span>
                <span id="totpCountdown" style="font-family: monospace; color: var(--color-primary, #10b981);">Refreshes in ${sec}s</span>
            </div>
            <input class="form-input" id="nfc2faInput" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autofocus style="text-align: center; font-family: monospace; font-size: 1.4rem; letter-spacing: 0.35em;">
        </div>
        <div id="nfc2faError" style="color: #ef4444; font-size: 0.82rem; margin-top: 8px; text-align: center; display: none;"></div>
        <div style="text-align: center; margin-top: 1rem;">
            <button type="button" id="toggle2faModeBtn" class="btn-ghost" style="font-size: 0.8rem; text-decoration: underline;">Lost phone? Use an emergency backup code</button>
        </div>
        `;
    };

    const attachEvents = () => {
        const toggleBtn = document.getElementById('toggle2faModeBtn');
        toggleBtn?.addEventListener('click', () => {
            isBackupMode = !isBackupMode;
            const body = document.getElementById('modalBody');
            if (body) {
                body.innerHTML = renderBody();
                attachEvents();
                setTimeout(() => document.getElementById('nfc2faInput')?.focus(), 50);
            }
        });
    };

    openModal({
        title: 'Two-Factor Authentication',
        content: renderBody(),
        submitLabel: 'Verify & Enter',
        cancelLabel: 'Sign Out',
        showCancel: true,
        dismissible: false,
        onClose: () => {
            clearInterval(timer);
            if (onCancel) onCancel();
        },
        onSubmit: async (e) => {
            e?.preventDefault();
            const input = document.getElementById('nfc2faInput')?.value || '';
            const errEl = document.getElementById('nfc2faError');

            if (isBackupMode) {
                const cleanBackup = input.trim().toUpperCase();
                if (!cleanBackup) {
                    if (errEl) { errEl.textContent = 'Enter an 8-character backup code'; errEl.style.display = 'block'; }
                    return;
                }
                const ok = store.verify2FABackupCode(cleanBackup);
                if (!ok) {
                    if (errEl) { errEl.textContent = 'Invalid or already used backup code'; errEl.style.display = 'block'; }
                    return;
                }
                clearInterval(timer);
                closeModal();
                store.markSession2FAVerified();
                if (onSuccess) onSuccess();
                return;
            }

            const cleanTotp = input.replace(/\D/g, '').slice(0, 6);
            if (cleanTotp.length !== 6) {
                if (errEl) { errEl.textContent = 'Enter a valid 6-digit code'; errEl.style.display = 'block'; }
                return;
            }

            const ok = await store.verify2FACode(cleanTotp);
            if (!ok) {
                if (errEl) { errEl.textContent = 'Invalid or expired 6-digit code. Check your app for the current code.'; errEl.style.display = 'block'; }
                return;
            }

            clearInterval(timer);
            closeModal();
            store.markSession2FAVerified();
            if (onSuccess) onSuccess();
        }
    });

    attachEvents();

    timer = setInterval(() => {
        const countdownEl = document.getElementById('totpCountdown');
        if (countdownEl && !isBackupMode) {
            countdownEl.textContent = `Refreshes in ${getTotpSecondsRemaining()}s`;
        }
    }, 1000);
}

/**
 * Open interactive 2FA Setup Wizard in Tocaito / NFC Tag Manager.
 */
export async function open2FASetupModal(onActivated) {
    const secret = generateTotpSecret(32);
    const backupCodes = generateBackupCodes(8);
    const email = store.user?.email || 'admin@tocaito.com';
    const otpAuthUri = buildOtpAuthUri(secret, email, 'Tocaito');

    let qrDataUrl = '';
    try {
        qrDataUrl = await QRCode.toDataURL(otpAuthUri, { width: 180, margin: 1 });
    } catch (e) {
        console.error('Failed to generate QR code:', e);
    }

    const content = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="text-align: center;">
            <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">
                Scan this QR code with <strong>Google Authenticator</strong>, <strong>Apple Passwords</strong>, <strong>Authy</strong>, or <strong>1Password</strong>:
            </p>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 12px; max-width: 200px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            ${qrDataUrl ? `<img src="${qrDataUrl}" alt="2FA QR Code" width="180" height="180" style="display: block;">` : '<p>QR Code Unavailable</p>'}
        </div>

        <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.78rem;">Or Enter Secret Key Manually:</label>
            <div style="display: flex; gap: 8px;">
                <input class="form-input" type="text" readonly value="${secret}" style="font-family: monospace; font-size: 0.85rem; letter-spacing: 0.1em; background: rgba(0,0,0,0.2);">
                <button type="button" class="btn btn-secondary" id="copySecretKeyBtn" style="white-space: nowrap; font-size: 0.8rem;">Copy Key</button>
            </div>
        </div>

        <div style="padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.78rem; font-weight: 600;">Emergency Backup Codes:</span>
                <button type="button" class="btn-ghost" id="copyBackupCodesBtn" style="font-size: 0.75rem; text-decoration: underline; padding: 0;">Copy All Codes</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-family: monospace; font-size: 0.8rem; text-align: center;">
                ${backupCodes.map(c => `<div style="padding: 3px; background: rgba(0,0,0,0.25); border-radius: 4px;">${c}</div>`).join('')}
            </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Enter the 6-digit confirmation code from your app:</label>
            <input class="form-input" id="setupVerifyCodeInput" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autofocus style="text-align: center; font-family: monospace; font-size: 1.3rem; letter-spacing: 0.3em;">
            <div id="setupErrorMsg" style="color: #ef4444; font-size: 0.8rem; margin-top: 6px; display: none;"></div>
        </div>
    </div>
    `;

    openModal({
        title: 'Enable Two-Factor Authentication',
        content,
        submitLabel: 'Verify & Activate 2FA',
        showCancel: true,
        onSubmit: async (e) => {
            e?.preventDefault();
            const input = document.getElementById('setupVerifyCodeInput')?.value || '';
            const cleanCode = input.replace(/\D/g, '').slice(0, 6);
            const errEl = document.getElementById('setupErrorMsg');

            if (cleanCode.length !== 6) {
                if (errEl) { errEl.textContent = 'Please enter the 6-digit code from your authenticator app'; errEl.style.display = 'block'; }
                return;
            }

            const ok = await verifyTotpCode(secret, cleanCode, 1);
            if (!ok) {
                if (errEl) { errEl.textContent = 'Invalid code. Check device time and try the current code.'; errEl.style.display = 'block'; }
                return;
            }

            store.enable2FA(secret, backupCodes);
            closeModal();
            showToast('Two-Factor Authentication is now enabled!', 'success');
            if (onActivated) onActivated();
        }
    });

    document.getElementById('copySecretKeyBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(secret);
        showToast('Secret key copied to clipboard!', 'success');
    });

    document.getElementById('copyBackupCodesBtn')?.addEventListener('click', () => {
        const text = `Tocaito Backup Codes (${email}):\n\n` + backupCodes.join('\n');
        navigator.clipboard.writeText(text);
        showToast('Emergency backup codes copied!', 'success');
    });
}
