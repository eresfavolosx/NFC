## 2024-05-22 - Secure PIN Storage Migration
**Vulnerability:** Admin PIN was stored in plaintext in `localStorage`, exposing it to anyone with access to the browser's storage.
**Learning:** Legacy data structures in `localStorage` can persist indefinitely. Security fixes involving data format changes (like hashing) must include a migration strategy for existing users.
**Prevention:** Always use hashing for secrets, even on the client-side. When upgrading security, check for legacy data formats and migrate them on first access.
