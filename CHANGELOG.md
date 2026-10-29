# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added — 2026-10-29
- Project README: overview, feature matrix, architecture diagram, tech stack, setup (web, iOS, E2E), and project structure.
- This `CHANGELOG.md`.
- Repository metadata: description, homepage (`https://nfc.novu.works`), and discovery topics.

## [0.1.0] — 2026-02 → 2026-10

### Added
- NFC tag writing through Web NFC and native Capacitor NFC, with a guided iOS flow.
- Dynamic redirect system, link/tag/template management, and an analytics dashboard with CSV export.
- Firebase Google Sign-In, PIN-protected admin, and native biometric unlock.
- Haptics, geolocation, i18n, PWA manifest, and service worker.
- Native iOS project through Capacitor 8.
- Node test suites (store, security) and Python/Playwright verification scripts.

### Security
- Input sanitization and XSS hardening across the links and tags views, with regression tests.

### Performance
- Debounced inputs and rendering optimizations.
