## 2025-05-26 - Plaintext PIN Storage
**Vulnerability:** The admin PIN was stored in plaintext in `localStorage`.
**Learning:** `localStorage` is accessible via XSS, making plaintext secrets vulnerable. `defaultData` in `store.js` also exposed the default PIN.
**Prevention:** Always hash secrets before storing them. Used `crypto.subtle.digest` (SHA-256) to hash the PIN. Implemented a migration path to hash legacy plaintext PINs on login.
