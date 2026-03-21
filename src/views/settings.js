/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Settings View
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';

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
            <input class="form-input" type="text" id="brandName" value="${settings.brandName || ''}" placeholder="e.g. My Awesome Brand">
          </div>
          
          <div class="settings-divider"></div>

          <div class="form-group-row">
            <div class="form-info">
              <label class="form-label">Restaurant Mode</label>
              <p class="form-desc">Optimize the interface for restaurant menu management and bulk table programming.</p>
            </div>
            <label class="switch">
              <input type="checkbox" id="restaurantMode" ${settings.restaurantMode ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>

          <div id="restaurantSettings" style="display: ${settings.restaurantMode ? 'block' : 'none'}; margin-top: var(--space-md);">
            <div class="form-group">
              <label class="form-label" for="restaurantName">Restaurant Name</label>
              <input class="form-input" type="text" id="restaurantName" value="${settings.restaurantName || ''}" placeholder="e.g. La Trattoria">
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

          <div class="form-group-row">
            <div class="form-info">
              <label class="form-label">Dynamic Redirection</label>
              <p class="form-desc">Program tags with a cloud link so you can update the destination remotely.</p>
            </div>
            <label class="switch">
              <input type="checkbox" id="dynamicRedirection" ${settings.dynamicRedirection ? 'checked' : ''}>
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
    const modeToggle = document.getElementById('restaurantMode');
    const restaurantSettings = document.getElementById('restaurantSettings');
    const saveBtn = document.getElementById('saveSettingsBtn');

    modeToggle?.addEventListener('change', (e) => {
        restaurantSettings.style.display = e.target.checked ? 'block' : 'none';
    });

    saveBtn?.addEventListener('click', () => {
        const brandName = document.getElementById('brandName').value;
        const restaurantMode = document.getElementById('restaurantMode').checked;
        const restaurantName = document.getElementById('restaurantName').value;
        const useBiometrics = document.getElementById('useBiometrics').checked;
        const dynamicRedirection = document.getElementById('dynamicRedirection').checked;

        store.updateSettings({
            brandName,
            restaurantMode,
            restaurantName,
            useBiometrics,
            dynamicRedirection
        });

        showToast('Settings saved successfully!', 'success');
        
        // Update document title if brand name changed
        if (brandName) {
            document.title = brandName;
        }
    });
}
