/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Hash Router
   ═══════════════════════════════════════════════════════════ */

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
    routes[path] = handler;
}

import { navigate } from './utils.js';
export { navigate };

export function getCurrentRoute() {
    const hash = window.location.hash.slice(1);
    return hash;
}

export function startRouter() {
    const handleRoute = async () => {
        let hash = getCurrentRoute();
        
        // Normalize hash: ensure leading slash, remove trailing slash
        if (!hash.startsWith('/')) hash = '/' + hash;
        if (hash.length > 1 && hash.endsWith('/')) hash = hash.slice(0, -1);
        if (hash === '') hash = '/';

        console.log(`[Router] Navigating to: ${hash}`);
        
        let handler = null;
        let params = {};

        // 1. Try Exact Match first (highest priority)
        if (routes[hash]) {
            handler = routes[hash];
        } 
        // 2. Try Parameterzed Match
        else {
            for (const path in routes) {
                if (path.includes(':')) {
                    const regexPath = path.replace(/:[^\s/]+/g, '([^/]+)');
                    const match = hash.match(new RegExp(`^${regexPath}$`));
                    if (match) {
                        handler = routes[path];
                        const paramNames = (path.match(/:[^\s/]+/g) || []).map(p => p.slice(1));
                        params = paramNames.reduce((acc, name, i) => ({ ...acc, [name]: match[i + 1] }), {});
                        break;
                    }
                }
            }
        }

        if (!handler && hash === '/') {
            handler = routes[''];
        }

        if (!handler) {
            console.warn(`[Router] 404 - No match for: ${hash}`);
            handler = routes['/404'];
        }

        if (currentCleanup && typeof currentCleanup === 'function') {
            currentCleanup();
        }

        if (handler) {
            currentCleanup = await handler(params);
        }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    return () => window.removeEventListener('hashchange', handleRoute);
}
