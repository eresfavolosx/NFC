/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Business Templates
   ═══════════════════════════════════════════════════════════ */

import { store } from '../store.js';
import { navigate, renderHeader, escapeHTML, showToast } from '../utils.js';

const TEMPLATES = [
    {
        id: 'restaurant',
        name: '🍴 Restaurant & Cafe',
        description: 'Set up digital menus and Google Reviews.',
        links: [
            { title: 'Digital Menu', url: 'https://example.com/menu', icon: '📜' },
            { title: 'Google Review', url: 'https://g.page/r/your-id/review', icon: '⭐' },
            { title: 'Instagram', url: 'https://instagram.com/your-restaurant', icon: '📸' }
        ]
    },
    {
        id: 'hospitality',
        name: '🏨 Hospitality & Hotels',
        description: 'Guest services, Wi-Fi, and check-in portals.',
        links: [
            { title: 'Guest Services', url: 'https://example.com/services', icon: '🛎️' },
            { title: 'Wi-Fi Portal', url: 'https://example.com/wifi', icon: '📶' },
            { title: 'Area Guide', url: 'https://example.com/guide', icon: '🗺️' }
        ]
    },
    {
        id: 'business',
        name: '💼 Digital Business Card',
        description: 'Share your LinkedIn, vCard, and Portfolio.',
        links: [
            { title: 'LinkedIn Profile', url: 'https://linkedin.com/in/username', icon: '🔗' },
            { title: 'Portfolio Website', url: 'https://yourportfolio.com', icon: '🌐' },
            { title: 'Download vCard', url: 'https://example.com/contact.vcf', icon: '📇' }
        ]
    }
];

export function renderTemplates() {
    const container = document.getElementById('app');

    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Business Templates</h1>
                <p class="page-subtitle">Quickly set up your NFC tags with industry presets</p>
            </div>
        </div>

        <div class="templates-grid">
            ${TEMPLATES.map(t => `
                <div class="card-glass template-card animate-fade-up">
                    <div class="template-header">
                        <h2 class="template-title">${t.name}</h2>
                        <p class="template-desc">${t.description}</p>
                    </div>
                    <div class="template-preview">
                        ${t.links.map(l => `
                            <div class="template-link-pill">
                                <span>${l.icon}</span> ${l.title}
                            </div>
                        `).join('')}
                    </div>
                    <div class="template-footer" style="margin-top: auto;">
                        <button class="btn btn-primary template-apply-btn w-full" data-id="${t.id}">
                            Use Template
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Apply Template Event
    container.querySelectorAll('.template-apply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = btn.getAttribute('data-id');
            const template = TEMPLATES.find(t => t.id === templateId);
            
            if (template) {
                if (confirm(`Apply "${template.name}" template? This will add 3 pre-configured links.`)) {
                    template.links.forEach(l => {
                        store.createLink({
                            title: l.title,
                            url: l.url,
                            icon: l.icon,
                            category: template.id
                        });
                    });
                    showToast(`${template.name} links added!`, 'success');
                    navigate('/links');
                }
            }
        });
    });
}
