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

    // New Tag / Activation State
    const isAuth = store.isAuthenticated;

    container.innerHTML = `
        <div class="login-page">
            <div class="card-glass animate-fade-up" style="text-align:center; padding: 2.5rem; max-width: 450px">
                <div class="stat-icon orange" style="margin: 0 auto var(--space-md); font-size: 2.5rem; background: rgba(255, 126, 68, 0.1); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">📡</div>
                
                <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;" class="text-gradient">New Tag Detected!</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">
                    This Tocaito NFC tag is ready to be activated. ${isAuth ? 'Claim it now to start tracking your links!' : 'Login to your account to register this tag.'}
                </p>

                ${isAuth ? `
                    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                        <button id="activate-tag-btn" class="btn btn-primary w-full" style="height: 52px; font-weight: 600;">
                            ✨ Claim & Activate Tag
                        </button>
                        <a href="#/dashboard" style="font-size: 0.85rem; color: var(--text-muted);">Decide later</a>
                    </div>
                ` : `
                    <button id="login-to-claim-btn" class="btn btn-primary w-full" style="height: 52px; font-weight: 600;">
                        🔑 Login to Activate
                    </button>
                `}
                
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted);">
                    Tag ID: <span style="font-family: monospace; opacity: 0.8;">${id}</span>
                </div>
            </div>
        </div>
    `;

    // Events
    document.getElementById('activate-tag-btn')?.addEventListener('click', () => {
        try {
            const newTag = store.createTag({ id, label: 'New Tocaito Tag' });
            showToast('Tag registered to your account!', 'success');
            
            // Immediately offer to link it
            openLinkPickerForTag(newTag.id);
        } catch (e) {
            showToast(e.message, 'error');
        }
    });

    document.getElementById('login-to-claim-btn')?.addEventListener('click', () => {
        // Store the target tag ID in session so we can return here after login if needed
        sessionStorage.setItem('pending_tag_activation', id);
        navigate('/login');
    });
}

function openLinkPickerForTag(tagId) {
    const links = store.links;
    
    openModal({
        title: '🔗 Assign a Link',
        content: `
            <p style="margin-bottom: var(--space-md); color: var(--text-secondary); font-size: 0.9rem;">What should happen when someone taps this tag?</p>
            <div class="form-group">
                <label class="form-label">Choose Link</label>
                <select class="form-select" id="claim-link-select">
                    <option value="">— Select a saved link —</option>
                    ${links.map(l => `<option value="${l.id}">${l.icon} ${l.title}</option>`).join('')}
                </select>
            </div>
            <p style="font-size: 0.75rem; margin-top: var(--space-sm); color: var(--text-muted);">
                You can create more links in the "Links" section later.
            </p>
        `,
        submitLabel: '🚀 Finish Activation',
        onSubmit: () => {
            const linkId = document.getElementById('claim-link-select').value;
            if (linkId) {
                store.assignLinkToTag(tagId, linkId);
                showToast('Link assigned successfully!', 'success');
                closeModal();
                navigate('/tags');
            } else {
                showToast('Tag claimed! You can assign a link later in the Tags tab.', 'info');
                closeModal();
                navigate('/tags');
            }
        }
    });
}
