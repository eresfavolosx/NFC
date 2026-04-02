/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Redirection Handler
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { isValidUrl, escapeHTML } from '../utils/sanitize.js';
import { navigate } from '../router.js';
import { showToast } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';

/**
 * Renders the redirection or activation screen for a tag scan.
 * Logic:
 * 1. If tag is active (has link) AND owned by the user -> Redirect Immediately.
 * 2. If tag is provisioned/unclaimed -> Show Activation Screen.
 * 3. On Activation Screen, if link exists -> Show "Continue to Destination" option.
 */
export function renderRedirect({ id }) {
    const container = document.getElementById('app');
    const t = (key) => store.t(key);
    
    // Tag lookup (raw data lookup)
    const tag = store.getTag(id);
    
    if (!tag) {
        container.innerHTML = `<div class="p-4 text-center">Tag not found</div>`;
        return;
    }

    const isAuth = store.isAuthenticated;
    const currentUserEmail = store.user?.email?.toLowerCase().trim();
    const tagOwnerEmail = tag.ownerEmail?.toLowerCase().trim();
    const isOwner = tagOwnerEmail && tagOwnerEmail === currentUserEmail;
    const hasDestination = tag.assignedLinkId;
    const link = hasDestination ? store.getLink(tag.assignedLinkId) : null;

    // ── SCENARIO 1: Tag is fully claimed and owned ──
    // If it's already their tag and it's active, show interstitial with auto-redirect
    if (isOwner && hasDestination && link && isValidUrl(link.url)) {
        store.incrementClicks(link.id);
        
        container.innerHTML = `
            <div class="login-page">
                <div class="card-glass animate-fade-up" style="text-align:center; padding: 2.5rem; max-width: 450px">
                    <div class="stat-icon green" style="margin: 0 auto var(--space-md); font-size: 2.5rem; background: rgba(76, 175, 80, 0.1); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">🔗</div>
                    <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;" class="text-gradient">${t('redirecting')}</h1>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                        ${t('returning_in')} <span id="redirect-countdown" style="font-weight: 600; color: var(--text-primary);">3</span>s.
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                        <a href="${escapeHTML(link.url)}" class="btn btn-primary w-full" style="height: 52px; font-weight: 600;">
                            ${t('go_now')}
                        </a>
                        <button id="edit-destination-btn" class="btn btn-outline w-full" style="border-color: var(--border-color); color: var(--text-secondary);">
                            ${t('edit_destination')}
                        </button>
                        <a href="#/dashboard" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">${t('cancel')} & ${t('dashboard')}</a>
                    </div>
                </div>
            </div>
        `;

        let timeLeft = 3;
        const countdownEl = document.getElementById('redirect-countdown');
        
        const autoRedirect = setInterval(() => {
            timeLeft--;
            if (countdownEl) countdownEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(autoRedirect);
                window.location.href = link.url;
            }
        }, 1000);

        document.getElementById('edit-destination-btn')?.addEventListener('click', () => {
            clearInterval(autoRedirect); // Stop the countdown
            openLinkPickerForTag(tag.id);
        });

        return;
    }

    // ── SCENARIO 2: Access Control for provisioned tags ──
    const isProvisionedToSomeoneElse = tagOwnerEmail && tagOwnerEmail !== currentUserEmail && !store.isSuperAdmin();
    if (isProvisionedToSomeoneElse) {
        // BUT if it has a destination, let them go anyway? 
        // No, typically premium tags shouldn't be "scanned" by others if private.
        // However, the user said "already claimed... redirect automatically".
        // If it's claimed by someone else, but redirected...
        if (hasDestination && link && isValidUrl(link.url)) {
            store.incrementClicks(link.id);
            window.location.href = link.url;
            return;
        }

        container.innerHTML = `
            <div class="login-page">
                <div class="card-glass animate-fade-up" style="text-align:center; padding: 2.5rem; max-width: 450px">
                    <div class="stat-icon red" style="margin: 0 auto var(--space-md);">🔒</div>
                    <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${t('access_denied')}</h1>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                        ${t('already_provisioned')}
                    </p>
                    <a href="#/dashboard" class="btn btn-primary w-full">${t('dashboard')}</a>
                </div>
            </div>
        `;
        return;
    }

    // ── SCENARIO 3: Activation / Provisioned Screen ──
    container.innerHTML = `
        <div class="login-page">
            <div class="card-glass animate-fade-up" style="text-align:center; padding: 2.5rem; max-width: 450px">
                <div class="stat-icon ${isOwner ? 'green' : 'orange'}" style="margin: 0 auto var(--space-md); font-size: 2.5rem; background: ${isOwner ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 126, 68, 0.1)'}; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${isOwner ? '🎁' : '📡'}</div>
                
                <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;" class="text-gradient">
                    ${isOwner ? t('provisioned_welcome') : t('new_tag_detected')}
                </h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">
                    ${isOwner 
                        ? t('provisioned_desc') 
                        : (isAuth ? t('unclaimed_desc') : t('login_to_activate'))}
                </p>

                <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                    ${isAuth ? `
                        <button id="activate-tag-btn" class="btn btn-primary w-full" style="height: 52px; font-weight: 600; background: ${isOwner ? 'var(--color-success)' : 'var(--color-primary)'};">
                            ${isOwner ? t('activate_tag') : t('claim_tag')}
                        </button>
                    ` : `
                        <button id="login-to-claim-btn" class="btn btn-primary w-full" style="height: 52px; font-weight: 600;">
                            🔑 ${t('login_to_activate')}
                        </button>
                    `}

                    ${link && isValidUrl(link.url) ? `
                        <a href="${escapeHTML(link.url)}" id="skip-to-destination" class="btn btn-outline w-full" style="border-color: var(--border-color); color: var(--text-secondary);">
                            ➡️ ${t('cancel')} & ${t('dashboard')}
                        </a>
                    ` : `
                        <a href="#/dashboard" style="font-size: 0.85rem; color: var(--text-muted);">${t('dashboard')}</a>
                    `}
                </div>
                
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted);">
                    ${t('tag_id')}: <span style="font-family: monospace; opacity: 0.8;">${escapeHTML(id)}</span>
                </div>
            </div>
        </div>
    `;

    // Events
    document.getElementById('activate-tag-btn')?.addEventListener('click', () => {
        try {
            const newTag = store.createTag({ id, label: isOwner ? 'Provisioned Tag' : 'New Tocaito Tag' });
            showToast(t('tag_registered'), 'success');
            openLinkPickerForTag(newTag.id);
        } catch (e) {
            showToast(e.message, 'error');
        }
    });

    document.getElementById('login-to-claim-btn')?.addEventListener('click', () => {
        sessionStorage.setItem('pending_tag_activation', id);
        navigate('/login');
    });

    document.getElementById('skip-to-destination')?.addEventListener('click', () => {
        if (link) store.incrementClicks(link.id);
    });
}

function openLinkPickerForTag(tagId) {
    const links = store.links;
    const t = (key) => store.t(key);
    
    openModal({
        title: `🔗 ${t('link_assigned')}`,
        content: `
            <p style="margin-bottom: var(--space-md); color: var(--text-secondary); font-size: 0.9rem;">What should happen when someone taps this tag?</p>
            <div class="form-group">
                <label class="form-label">${t('links')}</label>
                <select class="form-select" id="claim-link-select">
                    <option value="">— Select a saved link —</option>
                    ${links.map(l => `<option value="${l.id}">${l.icon} ${l.title}</option>`).join('')}
                </select>
            </div>
        `,
        submitLabel: `🚀 ${t('confirm')}`,
        onSubmit: () => {
            const linkId = document.getElementById('claim-link-select').value;
            if (linkId) {
                store.assignLinkToTag(tagId, linkId);
                showToast(t('link_assigned'), 'success');
                closeModal();
                navigate('/tags');
            } else {
                closeModal();
                navigate('/tags');
            }
        }
    });
}
