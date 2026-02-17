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

        <div class="pin-display" id="pinDisplay">
          <span class="sr-only" aria-live="polite" id="pinAriaStatus">Enter 4-digit PIN</span>
          <span class="pin-dot" aria-hidden="true"></span>
          <span class="pin-dot" aria-hidden="true"></span>
          <span class="pin-dot" aria-hidden="true"></span>
          <span class="pin-dot" aria-hidden="true"></span>
        </div>

        <div class="pin-error" id="pinError" role="alert" aria-live="assertive"></div>

        <div class="pin-pad" id="pinPad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(n => {
        if (n === '') return '<button class="pin-key empty" disabled aria-hidden="true"></button>';
        if (n === '⌫') return `<button class="pin-key delete" data-action="delete" aria-label="Delete last digit">⌫</button>`;
        return `<button class="pin-key" data-digit="${n}" aria-label="Digit ${n}">${n}</button>`;
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
        const statusEl = document.getElementById('pinAriaStatus');
        if (statusEl) {
            statusEl.textContent = pin.length === 0
                ? 'Enter 4-digit PIN'
                : `${pin.length} digit${pin.length === 1 ? '' : 's'} entered`;
        }
    }

    function tryLogin() {
        if (store.login(pin)) {
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
