/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Modal Component
   ═══════════════════════════════════════════════════════════ */

let modalContainer = null;

export function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

function getContainer() {
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    return modalContainer;
}

// Security enhancement: Prevent DOM-based XSS when using template literals
export function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

export function openModal({ title, content, onSubmit, submitLabel = 'Save', showCancel = true }) {
    const container = getContainer();

    // 🛡️ Sentinel: Prevent XSS by using textContent for title and submitLabel
    container.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal animate-scale-in" role="dialog" aria-labelledby="modalTitle">
        <div class="modal-header">
          <h3 id="modalTitle"></h3>
          <button class="btn-icon btn-ghost modal-close" id="modalClose" aria-label="Close">✕</button>
        </div>
        <div class="modal-body" id="modalBody">
          ${content}
        </div>
        <div class="modal-footer">
          ${showCancel ? '<button class="btn btn-secondary" id="modalCancel">Cancel</button>' : ''}
          ${onSubmit ? `<button class="btn btn-primary" id="modalSubmit"></button>` : ''}
        </div>
      </div>
    </div>
  `;
    // Security: Use textContent to prevent DOM XSS when setting arbitrary modal titles
    container.querySelector('#modalTitle').textContent = title;
    if (onSubmit) {
        // Security: Use textContent to prevent DOM XSS on the submit button label
        container.querySelector('#modalSubmit').textContent = submitLabel;
    }

    container.querySelector('#modalTitle').textContent = title;
    if (onSubmit) { container.querySelector('#modalSubmit').textContent = submitLabel; }

    container.querySelector('#modalTitle').textContent = title;
    if (onSubmit) {
        container.querySelector('#modalSubmit').textContent = submitLabel;
    }

    // Secure assignment via textContent to prevent DOM-based XSS in title
    container.querySelector('#modalTitle').textContent = title;

    container.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const close = () => closeModal();

    document.getElementById('modalClose')?.addEventListener('click', close);
    document.getElementById('modalCancel')?.addEventListener('click', close);
    document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalBackdrop') close();
    });

    if (onSubmit) {
        document.getElementById('modalSubmit')?.addEventListener('click', () => {
            onSubmit();
        });
    }

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

export function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
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
