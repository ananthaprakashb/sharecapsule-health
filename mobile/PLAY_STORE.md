# Vital Android / Google Play release

This folder documents the Android release of **Vital by ShareCapsule**.

## Release identity

- App name: **Vital by ShareCapsule**
- Android application ID: `org.sharecapsule.vital`
- Version name: `1.0.0`
- Version code: `1`
- Target SDK: Android API 36
- Minimum SDK: Android API 24
- Play category: Health & Fitness
- Public privacy page: `https://health.sharecapsule.org/#/privacy`

The application ID becomes a long-lived Play Store identity after publication. Do not change it casually.

## Architecture

The Android app is a Capacitor hybrid application, not a remote website wrapper. The React + TypeScript + Vite production bundle is copied into the Android application and runs locally inside Capacitor's WebView.

The first Android release intentionally keeps the same local-first model as the PWA:

- no account required
- activity history and settings stay local to the Android app
- no analytics or advertising SDKs
- no Health Connect or medical-record access yet
- microphone access is requested only when a voice feature needs it
- Thank Someone raw audio is not persisted in Vital history
- AI progress sharing remains user initiated

Android-app local data and browser-PWA local data are separate in v1.0.0. Optional account/cloud synchronization may be introduced later; do not imply that the first release syncs across devices.

## Generate the Android project

Requirements:

- Node.js 22+
- Android Studio compatible with Capacitor 8
- Android SDK Platform 36
- Java 21 is used by CI

From the repository root:

```bash
npm install
npm run android:prepare
npm run android:open
```

`android:prepare`:

1. builds the Vite application
2. creates `android/` with Capacitor when needed
3. syncs the current web bundle
4. generates Android icons and splash resources from `assets/logo.svg`
5. adds only the native permissions currently required
6. applies version metadata from `mobile/android-release.json`
7. validates min/target SDK values

The generated `android/` directory is intentionally ignored by Git. It can always be reproduced from the committed config and scripts.

## Native permissions in v1.0.0

Required:

- `INTERNET` — Capacitor/WebView and user-initiated external links/sharing flows
- `RECORD_AUDIO` — Thank Someone voice recording
- `MODIFY_AUDIO_SETTINGS` — Android WebView audio capture support

Not requested:

- camera
- location
- contacts
- Health Connect

The generated Android manifest also sets `android:allowBackup="false"` and disallows cleartext HTTP traffic. Vital already provides explicit local backup/restore controls, so automatic Android cloud backup is not enabled for local wellness data.

## Build for testing

Android Studio can run the generated project on a device/emulator, or use:

```bash
npm run android:run
```

CI also generates a debug APK and an unsigned release AAB to validate that the native project compiles.

## Play signing and production AAB

Before the first production upload:

1. Enroll the app in **Google Play App Signing**.
2. Create a dedicated upload key/keystore.
3. Keep the keystore and passwords outside Git. Never commit them to this repository.
4. Run `npm run android:prepare`.
5. Open the generated Android project in Android Studio.
6. Use **Build → Generate Signed Bundle / APK → Android App Bundle**.
7. Select the upload key and generate the signed `.aab`.
8. Upload that signed bundle to an Internal testing release first.

A CI signing workflow can be added after the Play application and upload key exist. Secrets should be stored in GitHub Actions secrets, not source control.

## Suggested Play Store listing

### Short description

Small daily habits for breathing, movement, learning, rest, gratitude and reflection.

### Full description

**Vital by ShareCapsule** is a simple local-first wellness app built around small actions that fit into everyday life.

Support six daily foundations:

- Breathe — guided breathing, including Thirumoolar 1:4:2 practice
- Move — stretching, mindful walking and movement breaks
- Learn — intentional reading and Active Recall
- Restore — sleep self-reflection and gentle wind-down practices
- Connect — record and share a meaningful thank-you
- Reflect — self-confirmed wellness check-ins and meditation

Vital is designed around balance rather than perfection. Core use does not require an account, and your activity history, routines and preferences stay on your device.

Voice check-ins do not infer emotions from vocal tone. Wellness labels are confirmed by you. AI sharing is optional and user initiated.

Vital provides general wellness activities and is not medical diagnosis or treatment.

## Data Safety preparation

The first release is intentionally designed to minimize data collection:

- no ShareCapsule account required
- no analytics/tracking SDK in the current build
- no advertising SDK
- wellness history is stored locally on the device
- microphone access is used only for user-triggered voice features
- raw gratitude audio is temporary and not saved into Vital history
- data sent through a device share destination is initiated by the user
- no Health Connect, location, contacts or medical records are read

**Do not copy these bullets blindly into Play Console.** Recheck the final signed AAB and every dependency against the current Google Play Data Safety definitions before submission.

## Content / policy checks before production

- Privacy Policy URL loads publicly without login.
- Store screenshots match the actual Android app.
- Wellness claims remain non-medical.
- Complete the content-rating questionnaire from actual app behavior.
- Choose the target audience from the intended product audience; do not select Families/children merely because students may use the app.
- Verify microphone disclosure and permission behavior on a physical Android device.
- Test offline launch, Thirumoolar audio, Thank Someone record/playback, Reading/Active Recall, Restore, local progress, backup/restore and AI sharing.

## Known v1.0.0 limitations

- Browser/PWA history does not automatically sync into the Android app.
- Closed-app native routine notifications are not enabled yet; reminders work while Vital is open.
- Health Connect / verified steps are not enabled yet.
- Native share/filesystem enhancements can be added after the initial Android shell is validated.

These are intentional boundaries for the first store release, not hidden capabilities.
