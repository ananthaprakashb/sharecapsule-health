# Chrome Web Store update checklist — v1.1.0

Existing listing: **Thirumoolar Pranayama Breathwork**

## Before upload

- Merge this extension source into `main`.
- Confirm `https://health.sharecapsule.org/#/activity/thirumoolar` works over HTTPS.
- Validate the current Vital Thirumoolar experience on desktop Chrome.
- Download the packaged extension artifact from the GitHub Actions workflow or zip the runtime files under `chrome-extension/`.

The upload ZIP root should contain:

- `manifest.json`
- `background.js`
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

Do not include README/release documentation in the store ZIP.

## Store update

1. Open the Chrome Web Store Developer Dashboard.
2. Select the existing **Thirumoolar Pranayama Breathwork** item.
3. Upload the v1.1.0 ZIP as a new package version.
4. Keep the existing item/listing so current users receive the update automatically.
5. Reconfirm the privacy declaration: the extension itself requests no permissions and collects no data.
6. Submit the update for review.

## Suggested release note

> v1.1.0 now opens the current Vital by ShareCapsule Thirumoolar experience, keeping the extension aligned with the latest 1:4:2 timer, Tamil/English guidance, visual breathing cues, chime behavior and reliability improvements.

## Validation after Web Store rollout

- Existing extension ID is unchanged.
- Clicking the toolbar icon opens a 560×820 app-style Vital practice window.
- Start and Stop work.
- Purakam → Kumbakam → Rechakam runs continuously at 1:4:2.
- Base unit changes before a session work.
- Chime plays from the Start gesture and at each phase transition.
- Closing the practice window and clicking the extension again opens it normally.
