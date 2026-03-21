/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Redirection Handler
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { isValidUrl } from '../utils/sanitize.js';
import { navigate } from '../router.js';
import { showToast } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderRedirect({ id }) {
    const container = document.getElementById('app');
    
    // Tag lookup
    const tag = store.getTag(id);
    const t = (key) => store.t(key);

    if (tag && tag.assignedLinkId) {
        const link = store.getLink(tag.assignedLinkId);
        if (link && isValidUrl(link.url)) {
            // Log interaction
            store.incrementClicks(link.id);
            
            // Redirect
            window.location.href = link.url;
            return;
        }
    }

    // New Tag / Activation State / Provisioning
    const isAuth = store.isAuthenticated;
    const currentUserEmail = store.user?.email?.toLowerCase().trim();
    const tagOwnerEmail = tag?.ownerEmail?.toLowerCase().trim();
    const isOwner = tagOwnerEmail && tagOwnerEmail === currentUserEmail;
    const isProvisionedToSomeoneElse = tagOwnerEmail && tagOwnerEmail !== currentUserEmail && !store.isSuperAdmin();

    if (isProvisionedToSomeoneElse) {
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

                ${isAuth ? `
                    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                        <button id="activate-tag-btn" class="btn btn-primary w-full" style="height: 52px; font-weight: 600; background: ${isOwner ? 'var(--color-success)' : 'var(--color-primary)'};">
                            ${isOwner ? t('activate_tag') : t('claim_tag')}
                        </button>
                        <a href="#/dashboard" style="font-size: 0.85rem; color: var(--text-muted);">${t('cancel')}</a>
                    </div>
                ` : `
                    <button id="login-to-claim-btn" class="btn btn-primary w-full" style="height: 52px; font-weight: 600;">
                        🔑 ${t('login_to_activate')}
                    </button>
                `}
                
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted);">
                    ${t('tag_id')}: <span style="font-family: monospace; opacity: 0.8;">${id}</span>
                </div>
            </div>
        </div>
    `;

    // Events
    document.getElementById('activate-tag-btn')?.addEventListener('click', () => {
        try {
            const newTag = store.createTag({ id, label: isOwner ? 'Provisioned Tag' : 'New Tocaito Tag' });
            showToast(t('tag_registered'), 'success');
            
            // Immediately offer to link it
            openLinkPickerForTag(newTag.id);
        } catch (e) {
            showToast(e.message, 'error');
        }
    });

    document.getElementById('login-to-claim-btn')?.addEventListener('click', () => {
        sessionStorage.setItem('pending_tag_activation', id);
        navigate('/login');
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
