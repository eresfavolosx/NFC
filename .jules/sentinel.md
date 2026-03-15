## 2024-05-22 - Plaintext PIN Migration Strategy
**Vulnerability:** The admin PIN was stored in plaintext in localStorage, exposing it to anyone with access to the browser storage.
**Learning:** Migrating existing users from plaintext to hashed credentials requires a dual-check strategy during login: hash the input and compare with stored hash (new/migrated users), OR compare input directly with stored plaintext (legacy users) and migrate upon success.
**Prevention:** Always use hashing for sensitive data from the start. For existing data, implement seamless migration paths in the authentication flow.
