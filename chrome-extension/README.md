# Thirumoolar Chrome Extension

This folder is the canonical source for the Chrome Web Store extension **Thirumoolar Pranayama Breathwork**.

## Compact widget design

The Chrome extension is intentionally a small, self-contained breathing widget. Clicking the toolbar icon opens a compact extension popup containing only the Thirumoolar 1:4:2 practice — it does **not** load the full Vital website.

The popup provides:

- continuous Purakam → Kumbakam → Rechakam cycles at 1:4:2
- Tamil + English phase guidance
- adjustable inhale base unit from 2–16 seconds
- animated breathing orb and phase-progress ring
- 528 Hz chime at each phase transition
- Start / Stop controls
- a small **Open full Vital** link for users who want routines, progress and the broader wellness app

The extension requests no Chrome permissions, injects no scripts into websites, and sends no breathing data to Vital. The inhale base preference is stored only in the extension's own local browser storage.

## Local test

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this `chrome-extension` folder.
5. Click the extension icon.
6. Confirm the compact breathing popup appears without opening the Vital site.
7. Test Start, Stop, base-unit controls, Tamil/English phase transitions, progress animation and chime.
8. Click **Open full Vital** and confirm it opens `https://health.sharecapsule.org/` in a normal browser tab.

## Chrome Web Store update

Upload the packaged v1.1.1 ZIP as an update to the existing extension so the existing extension ID and users are retained. Do not create a second store listing.

See `STORE_UPDATE.md` for the release checklist.
