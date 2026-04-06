/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Settings View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { escapeHTML } from '../utils/sanitize.js';

export function renderSettings() {
    const container = document.getElementById('page-content');
    const settings = store.settings;

    container.innerHTML = `
    ${renderHeader('Settings', 'Configure your NFC management environment')}

    <div class="page-container">
      <div class="card animate-fade-up">
        <div class="card-header">
          <h2 class="card-title">General Settings</h2>
        </div>
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label" for="brandName">Brand Name</label>
            <input class="form-input" type="text" id="brandName" value="${escapeHTML(settings.brandName || '')}" placeholder="e.g. My Awesome Brand">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="themeSelect">Theme</label>
            <select class="form-select" id="themeSelect">
              <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>System Default</option>
              <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
              <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
            </select>
          </div>
          
          <div class="settings-divider"></div>

          <div>
            <div class="form-group">
              <label class="form-label" for="restaurantName">Restaurant Name</label>
              <input class="form-input" type="text" id="restaurantName" value="${escapeHTML(settings.restaurantName || '')}" placeholder="e.g. La Trattoria">
            </div>
          </div>

          <div class="settings-divider"></div>

          <div class="form-group-row">
            <div class="form-info">
              <label class="form-label">Biometric Authentication</label>
              <p class="form-desc">Use FaceID or TouchID to unlock administrative settings.</p>
            </div>
            <label class="switch">
              <input type="checkbox" id="useBiometrics" ${settings.useBiometrics ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>



          <div class="settings-actions">
            <button class="btn btn-primary" id="saveSettingsBtn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `;

    initSettingsEvents();
}

function initSettingsEvents() {
    const restaurantSettings = document.getElementById('restaurantSettings');
    const saveBtn = document.getElementById('saveSettingsBtn');

    saveBtn?.addEventListener('click', () => {
        const brandName = document.getElementById('brandName').value;
        const restaurantName = document.getElementById('restaurantName').value;
        const useBiometrics = document.getElementById('useBiometrics').checked;
        const theme = document.getElementById('themeSelect').value;

        store.updateSettings({
            brandName,
            restaurantName,
            useBiometrics,
            theme
        });

        showToast('Settings saved successfully!', 'success');
        
        // Update document title if brand name changed
        if (brandName) {
            document.title = brandName;
        }
    });
}
