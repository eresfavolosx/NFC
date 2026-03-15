/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Hash Router
   ═══════════════════════════════════════════════════════════ */

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function getCurrentRoute() {
    const hash = window.location.hash.slice(1) || '/login';
    return hash;
}

export function startRouter() {
    const handleRoute = async () => {
        const hash = getCurrentRoute();
        
        let handler = null;
        let params = {};

        // Find matching route
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
            } else if (path === hash) {
                handler = routes[path];
                break;
            }
        }

        if (!handler) handler = routes['/404'];

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
