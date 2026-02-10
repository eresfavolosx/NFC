/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Header Component
   ═══════════════════════════════════════════════════════════ */

export function renderHeader(title, subtitle = '') {
    return `
    <header class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
      </div>
    </header>
  `;
}
