# Vital by ShareCapsule

**Vital by ShareCapsule** is a mobile-first, local-first wellness PWA for guided breathing, meditation, stretching, walking, eye breaks, voice self-check-ins, gratitude expression and daily routines.

**Tagline:** Small habits. Better well-being.

Production URL: `https://health.sharecapsule.org/`

The GitHub repository name remains `sharecapsule-health` for continuity.

## PWA capabilities

- Thirumoolar Pranayama 1:4:2 experience with its original UI and phase chime
- meditation, stretch, walking and eye-rest timers
- voice wellness check-ins with user-confirmed mood labels
- `Thank Someone` gratitude practice with short voice messages, playback and device sharing
- gratitude history stores metadata only; raw gratitude audio is not persisted by the app
- favorites and preset/custom routines
- configurable activity durations
- daily goals, streaks and achievement badges
- local routine schedules and browser notifications
- privacy-filtered progress sharing to a user-selected AI/app
- versioned `sharecapsule.health.progress.v1` JSON contract for future connectors
- installable/offline-capable PWA with controlled updates
- local data export, restore and reset controls
- no account required for the PWA experience

## Development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run typecheck
npm run build
```

## Routes

- `#/` — Today
- `#/routines` — routines and local schedules
- `#/progress` — progress and achievements
- `#/check-in` — voice wellness check-in
- `#/ai-sharing` — configure and share progress with a preferred AI/app
- `#/settings` — settings, install and local-data controls
- `#/privacy` — PWA privacy and data-use notice
- `#/activity/thirumoolar` — Thirumoolar Breath
- `#/activity/thank-someone` — gratitude voice-message practice

## Gratitude practice

`Thank Someone` is designed as a connection ritual rather than a competition feature: remember one specific act, record a short thank-you, listen back, then share it or keep the reflection private. The app tracks lightweight gratitude metadata and monthly counts, but deliberately avoids gratitude streaks and leaderboards. Audio remains in memory for playback/sharing and is not saved into history.

Research on gratitude interventions suggests small improvements in well-being overall; evidence for direct physical-health effects is mixed. Product copy should therefore describe gratitude as a general wellness practice rather than treatment.

## AI / assistant sharing

Progress sharing is provider-neutral and explicitly user initiated. Confirmed check-ins and gratitude counts are separate opt-ins and default off. Gratitude recipient names and voice recordings are never included in the progress payload.

The public product name is `Vital by ShareCapsule`, while the progress contract remains `sharecapsule.health.progress.v1` for compatibility with existing and future integrations.

## Deployment requirements

- Serve the production build over HTTPS. Microphone features require a secure context.
- The current manifest/service-worker paths assume deployment at the host root.
- Ensure `/sw.js`, `/manifest.webmanifest`, `/icon-192.png`, `/icon-180.png` and `/app-icon.svg` are served without authentication.
- Validate microphone permission, recording/playback, file sharing, install, offline reopening, updates and notifications on the production origin.

## Rebrand compatibility

Existing users keep their data through the rename from ShareCapsule Health to Vital by ShareCapsule:

- localStorage keys intentionally remain under the `sharecapsule-health:` prefix
- service-worker cache prefixes remain unchanged
- the `sharecapsule.health.progress.v1` contract remains unchanged
- new backups use `Vital by ShareCapsule`, while restore continues to accept legacy `ShareCapsule Health` version-1 backups

Do not rename those compatibility identifiers without a migration plan.

## Privacy

The current PWA stores goals, favorites, routines, schedules, settings, AI-sharing preferences, activity history, confirmed check-ins and gratitude metadata in browser local storage. It does not currently collect HealthKit, Health Connect or verified step data. Raw gratitude audio is not persisted by Vital by ShareCapsule.

## Safety

Vital by ShareCapsule provides general wellness guidance and does not diagnose, treat, cure or prevent medical conditions.
