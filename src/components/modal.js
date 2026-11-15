/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Modal Component
   ═══════════════════════════════════════════════════════════ */

import { escapeHTML } from '../utils/sanitize.js';

let modalContainer = null;
let activeEscHandler = null;
let activeOnClose = null;
let closeTimer = null;

function getContainer() {
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    return modalContainer;
}

export function openModal({
    title,
    content,
    onSubmit,
    onClose = null,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    showCancel = true,
    dismissible = true
}) {
    if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
    }
    if (activeEscHandler) {
        document.removeEventListener('keydown', activeEscHandler);
        activeEscHandler = null;
    }

    activeOnClose = typeof onClose === 'function' ? onClose : null;
    const container = getContainer();

    container.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal animate-scale-in" role="dialog" aria-labelledby="modalTitle">
        <div class="modal-header">
          <h3 id="modalTitle">${escapeHTML(title)}</h3>
          ${dismissible ? '<button class="btn-icon btn-ghost modal-close" id="modalClose" aria-label="Close">✕</button>' : ''}
        </div>
        <form id="modalForm">
          <div class="modal-body" id="modalBody">
            ${content}
          </div>
          <div class="modal-footer">
            ${showCancel ? `<button type="button" class="btn btn-secondary" id="modalCancel">${escapeHTML(cancelLabel)}</button>` : ''}
            ${onSubmit ? `<button type="submit" class="btn btn-primary" id="modalSubmit"></button>` : ''}
          </div>
        </form>
      </div>
    </div>
  `;

    // Security: Use textContent for user-provided strings
    const titleEl = container.querySelector('#modalTitle');
    if (titleEl) titleEl.textContent = title;

    if (onSubmit) {
        const submitBtn = container.querySelector('#modalSubmit');
        if (submitBtn) submitBtn.textContent = submitLabel;
    }

    container.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const handleCancelClose = () => {
        if (activeOnClose) {
            const fn = activeOnClose;
            activeOnClose = null;
            fn();
        }
        closeModal();
    };

    document.getElementById('modalClose')?.addEventListener('click', handleCancelClose);
    document.getElementById('modalCancel')?.addEventListener('click', handleCancelClose);
    document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
        if (dismissible && e.target.id === 'modalBackdrop') {
            handleCancelClose();
        }
    });

    document.getElementById('modalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    });

    // Focus first input
    setTimeout(() => {
        container.querySelector('input, select, textarea')?.focus();
    }, 100);

    // ESC key
    activeEscHandler = (e) => {
        if (dismissible && e.key === 'Escape') {
            handleCancelClose();
        }
    };
    document.addEventListener('keydown', activeEscHandler);
}

export function closeModal() {
    if (activeEscHandler) {
        document.removeEventListener('keydown', activeEscHandler);
        activeEscHandler = null;
    }
    activeOnClose = null;

    const container = getContainer();
    const modal = container.querySelector('.modal');

    if (modal) {
        modal.style.animation = 'scaleIn 0.2s ease reverse';
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            closeTimer = null;
            container.innerHTML = '';
            container.style.display = 'none';
            document.body.style.overflow = '';
        }, 180);
    } else {
        container.innerHTML = '';
        container.style.display = 'none';
        document.body.style.overflow = '';
    }
}

export function getModalFormData() {
    const container = getContainer();
    const form = container.querySelector('.modal-body');
    if (!form) return {};

    const data = {};
    form.querySelectorAll('[name]').forEach(el => {
        data[el.name] = el.value;
    });
    return data;
}
