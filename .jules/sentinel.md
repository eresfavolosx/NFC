## 2025-02-17 - Secure PIN Storage
**Vulnerability:** Admin PIN was stored in plaintext in `src/store.js` and `localStorage`, exposing it to anyone with access to the client-side code or storage.
**Learning:** Client-side only applications must use standard Web Crypto API (`crypto.subtle`) to hash secrets before storage, even if there is no backend. Backward compatibility for legacy plaintext data must be handled carefully during migration (hash on first successful login).
**Prevention:** Always use hashing (SHA-256 or better) for any secret storage, and never commit secrets to source code.
