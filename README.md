# Tocaito (`nfc.novu.works`) — Tactile NFC Physical-to-Digital Studio

[![Live Demo](https://img.shields.io/badge/demo-nfc.novu.works-0f172a?style=flat-square)](https://nfc.novu.works)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor%208-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Web NFC](https://img.shields.io/badge/Web%20NFC-NDEFReader-10b981?style=flat-square)

> *"What if a physical ring, vinyl record, or wooden token could act as a living portal to an interactive story with a single tap?"*

**Live Interactive Prototype:** **[nfc.novu.works](https://nfc.novu.works)** · [Explore on Novu Works](https://novu.works/#nfc-platform)  
**Maker:** **Fabián Vélez Vicente** (`@eresfavolosx`)

---

## ✨ The Concept
Digital connection has become trapped behind glass screens and QR codes. **Tocaito (NFC Studio)** explores the tactile joy of physical objects—asking how a simple tap of a ring, badge, or art piece can spark an immediate, memorable human encounter without requiring anyone to download an app.

---

## ⚙️ The Technology
- **Chrome Web NFC API (`NDEFReader`) & Capacitor Native Bridge:** Reads and writes physical **NTAG213/215/216** silicon microchips directly from a mobile browser or native iOS/Android runtime.
- **Binary NDEF & RFC 6350 vCard 3.0 Serialization:** Encodes contact payloads, dynamic cloud redirects, and cryptographic records with live byte-capacity telemetry (144B / 504B / 888B).
- **6DoF Spatial Card Physics & Haptics:** Combines device gyroscope orientation, specular foil shaders, and **Navigator Vibration API** (`navigator.vibrate`) tactile feedback.

---

## 🌱 The Impact
- Empowers independent artists, educators, and makers to program physical objects straight from the web—turning everyday artifacts into interactive portals of story and connection.

---

## 🚀 Quick Start (Open-Source Experiment)

```bash
git clone https://github.com/eresfavolosx/NFC.git
cd NFC
npm install
npm run dev
```
