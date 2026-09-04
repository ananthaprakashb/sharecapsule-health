# Thirumoolar Chrome Extension

This folder is the canonical source for the Chrome Web Store extension **Thirumoolar Pranayama Breathwork**.

## Why the extension opens the Vital web experience

The original extension shipped its own standalone breathing UI. That created two implementations of the same practice: the extension and the Vital web app.

Version 1.1.0 removes that duplication. Clicking the extension action opens the production Vital route:

`https://health.sharecapsule.org/#/activity/thirumoolar`

This keeps the extension aligned with the current Vital experience automatically:

- same Thirumoolar 1:4:2 timer and continuous cycles
- same Tamil/English phase labels
- same 528 Hz single chime behavior
- same adjustable inhale base unit
- same progress ring/orb UI
- same safety and browser fixes delivered through the web app
- same `health.sharecapsule.org` local progress history

The extension requests no Chrome permissions and does not inject scripts into websites.

## Local test

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this `chrome-extension` folder.
5. Click the extension icon.
6. Confirm a focused Vital practice window opens directly on Thirumoolar Pranayama.
7. Test Start, phase transitions, chime, base-unit controls and Stop.

## Chrome Web Store update

Upload the packaged v1.1.0 ZIP as an update to the existing extension so the existing extension ID and users are retained. Do not create a second store listing.

See `STORE_UPDATE.md` for the release checklist.
