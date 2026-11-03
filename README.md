# Tocaito (`nfc.novu.works`) — Cross-Platform Mobile & Physical NFC Tap Experience

[![Live Demo](https://img.shields.io/badge/demo-nfc.novu.works-0f172a?style=flat-square)](https://nfc.novu.works)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor%208-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Autonomous Agent](https://img.shields.io/badge/Agent--Assisted-.Jules%20%2B%20Playwright-10b981?style=flat-square)

> *"What if a physical ring, wristband, or studio token could connect physical objects with digital play through a single contactless tap?"*

**Live Interactive Prototype:** **[nfc.novu.works](https://nfc.novu.works)** · [Explore Procedural Physics & NFC on Novu Works](https://novu.works/#nfc-platform)  
**Maker:** **Fabián Vélez Vicente** (`@eresfavolosx`)

---

## ✨ The Concept
Digital interaction is too often trapped behind glass screens and static QR codes. **Tocaito** ("a gentle tap" in Puerto Rican Spanish) is a cross-platform mobile and physical **NFC tap experience** prototyped to connect physical objects—wristbands, badges, vinyl records, and collectibles—with **digital play** and live community storytelling.

---

## ⚙️ The Technology
- **Cross-Platform Mobile & Web NFC Stack (`Capacitor`, `Firebase`, `Vite`):** Runs from a single **Vite** codebase as both a native iOS/Android mobile app via **Capacitor 8** (`capacitor.config.json`, `ios/`) and an installable Progressive Web App using the browser's **Web NFC API (`NDEFReader`)** backed by **Firebase Hosting & Cloud Firestore** (`firebase.json`).
- **Co-Built with an Autonomous Coding Agent (`.Jules/` & `verification.py`):** Prototyped and iteratively hardened in collaboration with an autonomous coding agent (`.Jules/bolt.md` for performance, `.Jules/palette.md` for tactile UX & accessibility, and `.Jules/sentinel.md` for XSS/security auditing) alongside an automated **Python + Playwright** verification suite (`verification.py`).
- **Tactile & Procedural Physics Integration:** Paired on **[novu.works](https://novu.works)** with interactive 60 FPS procedural particle physics, 6DoF spatial card tilt, and binary NDEF/vCard 3.0 payload serialization.

---

## 🌱 The Impact
- Bridges atoms and bits in under **0.4 seconds**—allowing creators, event hosts, and players to reprogram physical NFC tokens over the air in real time without reflashing the underlying silicon.

---

## 🚀 Quick Start (Open-Source Experiment)

```bash
git clone https://github.com/eresfavolosx/NFC.git
cd NFC
npm install
npm run dev
```
