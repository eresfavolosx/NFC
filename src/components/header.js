/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Header Component
   ═══════════════════════════════════════════════════════════ */

import { escapeHTML } from '../utils/sanitize.js';

export function renderHeader(title, subtitle = '') {
    return `
    <header class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">${escapeHTML(title)}</h1>
        ${subtitle ? `<p class="page-subtitle">${escapeHTML(subtitle)}</p>` : ''}
      </div>
    </header>
  `;
}
