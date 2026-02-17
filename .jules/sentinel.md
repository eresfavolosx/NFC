## 2024-05-23 - XSS in Vanilla JS Views
**Vulnerability:** User input (titles, URLs, tag labels) was directly interpolated into HTML strings in views (`links.js`, `tags.js`, `writer.js`, `dashboard.js`), allowing arbitrary script execution via stored XSS.
**Learning:** The application uses vanilla JS with template literals for rendering, which lacks automatic context-aware escaping common in modern frameworks (React, Vue). Developers assumed local storage data was safe.
**Prevention:** Use a utility function `escapeHTML` for all dynamic data interpolation in HTML templates.
