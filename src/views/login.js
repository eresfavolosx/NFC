/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Login View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="login-page">
      <div class="login-card card-glass animate-scale-in">
        <div class="login-icon-wrap">
          <div class="login-icon">📱</div>
          <div class="nfc-ring"></div>
          <div class="nfc-ring"></div>
          <div class="nfc-ring"></div>
        </div>
        <h1 class="login-title">NFC Tag Manager</h1>
        <p class="login-subtitle">Enter your admin PIN to continue</p>

        <div class="pin-display" id="pinDisplay" role="status" aria-label="0 digits entered">
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
        </div>

        <div class="pin-error" id="pinError" aria-live="assertive"></div>

        <div class="pin-pad" id="pinPad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(n => {
        if (n === '') return '<button class="pin-key empty" disabled></button>';
        if (n === '⌫') return `<button class="pin-key delete" data-action="delete" aria-label="Delete">⌫</button>`;
        return `<button class="pin-key" data-digit="${n}" aria-label="${n}">${n}</button>`;
    }).join('')}
        </div>

        <p class="login-hint">Default PIN: 1234</p>
      </div>
    </div>
  `;

    let pin = '';
    const dots = app.querySelectorAll('.pin-dot');
    const errorEl = document.getElementById('pinError');

    function updateDots() {
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < pin.length);
        });
        document.getElementById('pinDisplay').setAttribute('aria-label', `${pin.length} digits entered`);
    }

    async function tryLogin() {
        if (await store.login(pin)) {
            showToast('Welcome back!', 'success');
            navigate('/dashboard');
        } else {
            errorEl.textContent = 'Wrong PIN. Try again.';
            const card = app.querySelector('.login-card');
            card.classList.add('animate-shake');
            setTimeout(() => card.classList.remove('animate-shake'), 500);
            pin = '';
            updateDots();
        }
    }

    document.getElementById('pinPad').addEventListener('click', (e) => {
        const key = e.target.closest('.pin-key');
        if (!key) return;

        if (key.dataset.action === 'delete') {
            pin = pin.slice(0, -1);
            errorEl.textContent = '';
            updateDots();
            return;
        }

        const digit = key.dataset.digit;
        if (digit !== undefined && pin.length < 4) {
            pin += digit;
            updateDots();
            if (pin.length === 4) {
                setTimeout(tryLogin, 200);
            }
        }
    });

    // Keyboard support
    const keyHandler = (e) => {
        if (e.key >= '0' && e.key <= '9' && pin.length < 4) {
            pin += e.key;
            updateDots();
            if (pin.length === 4) setTimeout(tryLogin, 200);
        } else if (e.key === 'Backspace') {
            pin = pin.slice(0, -1);
            errorEl.textContent = '';
            updateDots();
        }
    };
    document.addEventListener('keydown', keyHandler);

    return () => document.removeEventListener('keydown', keyHandler);
}
