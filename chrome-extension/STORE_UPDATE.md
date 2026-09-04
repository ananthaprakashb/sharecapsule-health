# Chrome Web Store update checklist — v1.1.1

Existing listing: **Thirumoolar Pranayama Breathwork**

## What changed

Version 1.1.1 keeps the extension focused on one job: a compact Thirumoolar 1:4:2 breathing widget.

It no longer opens the full Vital site when the toolbar icon is clicked. The extension popup now contains the breathing timer, Tamil/English phase labels, progress animation, adjustable inhale base and chime directly inside the extension. A small **Open full Vital** link is available for users who want the broader wellness app.

## Before upload

- Merge the compact-widget PR into `main`.
- Load `chrome-extension/` unpacked in Chrome.
- Confirm clicking the toolbar icon opens only the compact popup.
- Verify Start / Stop, 1:4:2 timing, base-unit controls, Tamil/English guidance and chime.
- Confirm **Open full Vital** opens `https://health.sharecapsule.org/` in a normal browser tab.
- Download the packaged extension artifact from GitHub Actions or zip the runtime files under `chrome-extension/`.

The upload ZIP root should contain:

- `manifest.json`
- `popup.html`
- `popup.css`
- `popup.js`
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

Do not include README/release documentation in the store ZIP.

## Store update

1. Open the Chrome Web Store Developer Dashboard.
2. Select the existing **Thirumoolar Pranayama Breathwork** item.
3. Upload the v1.1.1 ZIP as a new package version.
4. Keep the existing item/listing so current users receive the update automatically.
5. Reconfirm the privacy declaration: no permissions are requested and no breathing data is sent to Vital.
6. Submit the update for review.

## Suggested release note

> v1.1.1 brings Thirumoolar 1:4:2 back to a compact toolbar widget. Practice directly in the extension with Tamil/English phase cues, adjustable timing, visual guidance and chimes; open Vital separately only when you want the full wellness app.

## Validation after Web Store rollout

- Existing extension ID is unchanged.
- Toolbar click opens a compact popup, not a new Vital window.
- Purakam → Kumbakam → Rechakam runs continuously at 1:4:2.
- Base unit changes before a session work.
- Chime plays from the Start gesture and at each phase transition.
- Closing the popup stops the current popup session normally.
- **Open full Vital** opens the main Vital site in a separate tab.
