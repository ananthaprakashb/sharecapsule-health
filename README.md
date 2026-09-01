# ShareCapsule Health

ShareCapsule Health is a mobile-first, local-first wellness PWA for guided breathing, meditation, stretching, walking, eye breaks and daily routines.

## PWA capabilities

- Thirumoolar Pranayama 1:4:2 experience with its original UI and phase chime
- meditation, stretch, walking and eye-rest timers
- favorites and preset/custom routines
- configurable activity durations
- daily goals, streaks and achievement badges
- local routine schedules and browser notifications
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

Pull requests and pushes to `main` also run the GitHub Actions PWA CI build.

## Routes

The PWA uses hash routing so static hosts do not require SPA rewrite rules.

- `#/` — Today
- `#/routines` — routines and local schedules
- `#/progress` — progress and achievements
- `#/settings` — settings, install and local-data controls
- `#/privacy` — PWA privacy and data-use notice
- `#/activity/thirumoolar` — Thirumoolar Breath

## Deployment requirements

- Serve the production build over HTTPS.
- The current manifest/service-worker paths assume deployment at the host root. If deploying under a repository subpath, update the Vite base and absolute asset paths first.
- Ensure `/sw.js`, `/manifest.webmanifest`, `/icon-192.png`, `/icon-180.png` and `/app-icon.svg` are served without authentication.
- Validate install, offline reopening, service-worker updates and notifications on the actual production origin.
- Add the production canonical URL/sitemap only after the final domain is selected.

## Reminder limitation

PWA routine schedules are checked while the app is active and when it is reopened. Browser/system notifications are used when permission is available, but reliable delivery while the app is fully closed is not guaranteed without a push service or native scheduling.

## Privacy

The current PWA stores goals, favorites, routines, schedules, settings and activity history in browser local storage. It does not currently collect HealthKit, Health Connect or verified step data. Users can export, restore or clear ShareCapsule Health local data from Settings.

## Safety

ShareCapsule Health provides general wellness guidance and does not diagnose, treat, cure or prevent medical conditions. Activities should be practiced comfortably and stopped if they cause discomfort.
