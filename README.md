# ShareCapsule Health

ShareCapsule Health is a mobile-first wellness activity app. It starts with Thirumoolar Breath and is designed to expand into meditation, stretching, walking, posture, eye-break and daily routine activities.

## Phase 1

- React + TypeScript + Vite app shell
- Installable PWA manifest and service worker
- Reusable `HealthActivity` domain model
- Thirumoolar Breath 1:4:2 guided activity
- Local-first completion history; no account required
- Mobile-first, accessible UI
- Foundation for future Capacitor iOS and Android packaging

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

The first release uses hash routing so it can deploy safely to static hosting without server rewrite configuration.

- `#/` — Health home
- `#/breathe/thirumoolar` — Thirumoolar Breath

## Privacy approach

Phase 1 stores activity completion data only in the browser's local storage. No account or cloud health-data sync is required.

## Safety

ShareCapsule Health provides general wellness guidance and does not diagnose, treat, cure or prevent medical conditions. Breathing activities should be practiced comfortably without forcing breath retention.
