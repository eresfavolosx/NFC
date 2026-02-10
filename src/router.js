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
        const path = getCurrentRoute();
        const handler = routes[path] || routes['/404'];

        if (currentCleanup && typeof currentCleanup === 'function') {
            currentCleanup();
        }

        if (handler) {
            currentCleanup = await handler();
        }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    return () => window.removeEventListener('hashchange', handleRoute);
}
