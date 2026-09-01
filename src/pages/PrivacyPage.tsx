type PrivacyPageProps = { onBack: () => void }

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <main className="page-shell phase5-privacy-page">
      <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label="Back to Settings">←</button><div><p className="eyebrow">ShareCapsule Health</p><h1>Privacy</h1></div></header>

      <section className="settings-section"><p className="eyebrow">Current PWA</p><h2>Local-first wellness data</h2><p>Activity history, favorites, goals, routines, schedules and preferences are stored in this browser's local storage. The current PWA does not require a ShareCapsule account or upload this wellness history to a ShareCapsule server.</p></section>
      <section className="settings-section"><p className="eyebrow">AI & app sharing</p><h2>Nothing is sent automatically</h2><p>When you use Share with AI, ShareCapsule Health builds a progress summary locally from the fields you selected. Data leaves the browser only when you explicitly use the device share sheet, copy the update, or download the structured JSON. The receiving AI/app is governed by that provider's own privacy terms.</p></section>
      <section className="settings-section"><p className="eyebrow">AI progress contract</p><h2>Summary data, not raw health records</h2><p>The current <code>sharecapsule.health.progress.v1</code> payload contains wellness activity totals and optional goals, streaks, daily summaries and recent activity names. It does not contain HealthKit/Health Connect raw samples, medical records, device identifiers or verified step records.</p></section>
      <section className="settings-section"><p className="eyebrow">Notifications</p><h2>You stay in control</h2><p>Browser notification permission is optional. Routine reminder schedules are stored locally. Your operating system and browser control how system notifications, sounds and vibration are presented.</p></section>
      <section className="settings-section"><p className="eyebrow">Health data</p><h2>No step or medical-record access yet</h2><p>This PWA does not currently read Apple HealthKit, Android Health Connect, wearable step data or medical records. Any future verified-step or competition feature will require a separate native integration and explicit permission.</p></section>
      <section className="settings-section"><p className="eyebrow">Your controls</p><h2>Export or remove local data</h2><p>Settings provides controls to download a JSON backup, restore a compatible backup, or clear ShareCapsule Health data from this browser.</p></section>
      <section className="settings-section settings-privacy"><p className="eyebrow">Wellness scope</p><h2>Not medical treatment</h2><p>ShareCapsule Health provides general wellness activities. It is not a diagnostic or treatment service and is not a substitute for professional medical care.</p></section>
    </main>
  )
}
