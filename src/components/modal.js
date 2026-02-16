/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Modal Component
   ═══════════════════════════════════════════════════════════ */

let modalContainer = null;

function getContainer() {
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    return modalContainer;
}

export function openModal({ title, content, onSubmit, submitLabel = 'Save', showCancel = true }) {
    const container = getContainer();

    container.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal animate-scale-in" role="dialog" aria-labelledby="modalTitle">
        <div class="modal-header">
          <h3 id="modalTitle">${title}</h3>
          <button class="btn-icon btn-ghost modal-close" id="modalClose" aria-label="Close">✕</button>
        </div>
        <form id="modalForm">
          <div class="modal-body" id="modalBody">
            ${content}
          </div>
          <div class="modal-footer">
            ${showCancel ? '<button type="button" class="btn btn-secondary" id="modalCancel">Cancel</button>' : ''}
            ${onSubmit ? `<button type="submit" class="btn btn-primary" id="modalSubmit">${submitLabel}</button>` : ''}
          </div>
        </form>
      </div>
    </div>
  `;

    container.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const close = () => closeModal();

    document.getElementById('modalClose')?.addEventListener('click', close);
    document.getElementById('modalCancel')?.addEventListener('click', close);
    document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalBackdrop') close();
    });

    document.getElementById('modalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit();
        }
    });

    // Focus first input
    setTimeout(() => {
        container.querySelector('input, select, textarea')?.focus();
    }, 100);

    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

export function closeModal() {
    const container = getContainer();
    const modal = container.querySelector('.modal');

    if (modal) {
        modal.style.animation = 'scaleIn 0.2s ease reverse';
        setTimeout(() => {
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
