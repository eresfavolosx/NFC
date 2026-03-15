## 2025-02-18 - Client-Side Hashing & Migration
**Vulnerability:** Admin PIN stored in plaintext within localStorage, accessible via XSS.
**Learning:** Implemented a seamless migration strategy where legacy plaintext PINs are automatically hashed upon successful login, preventing user lockout while upgrading security.
**Prevention:** Always hash secrets before storage, even in client-side apps. Use `crypto.subtle` for standard, secure hashing.
