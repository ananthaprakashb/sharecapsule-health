import { APP_NAME } from '../brand'
import { isNativeApp } from '../platform/runtime'

type PrivacyPageProps = { onBack: () => void }

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  const native = isNativeApp()
  return (
    <main className="page-shell phase5-privacy-page">
      <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label="Back to Settings">←</button><div><p className="eyebrow">{APP_NAME}</p><h1>Privacy</h1></div></header>
      <section className="settings-section"><p className="eyebrow">Current app</p><h2>Local-first wellness data</h2><p>Activity history, learning reflections, sleep check-ins, gratitude moments, confirmed check-ins, favorites, goals, routines, schedules and preferences are stored locally on this device. No account is required for the core experience.</p></section>
      <section className="settings-section"><p className="eyebrow">Learning & sleep</p><h2>Detailed reflections stay on this device</h2><p>Reading may store an optional topic and short key idea locally. Active Recall does not persist the full recall or gap text; only an optional topic and short key idea are saved. Sleep check-ins may store your self-reported quality and approximate duration locally. These detailed learning and sleep fields are not added to the current AI progress payload.</p></section>
      <section className="settings-section"><p className="eyebrow">Voice gratitude</p><h2>Audio stays temporary unless you choose otherwise</h2><p>Thank Someone requests microphone access only after you tap record. {APP_NAME} keeps the recording temporarily in app memory for playback and sharing, but does not save raw gratitude audio into local history. Leaving or reloading the experience discards the in-memory recording unless you shared or downloaded it first. The app does not read your contacts.</p></section>
      <section className="settings-section"><p className="eyebrow">Voice check-ins</p><h2>User-confirmed, not voice emotion analysis</h2><p>The check-in feature does not classify emotion from pitch, tone, volume or other voice characteristics. Browser/device speech recognition, where available, may be processed under the browser or operating-system provider's terms. Saved mood labels are confirmed by you.</p></section>
      <section className="settings-section"><p className="eyebrow">AI & app sharing</p><h2>Nothing is sent automatically</h2><p>AI sharing is explicitly user initiated. Confirmed check-ins and gratitude counts each have separate opt-in controls. Gratitude recipient names, voice recordings, detailed learning notes and sleep-quality details are never included in the current progress payload.</p></section>
      <section className="settings-section"><p className="eyebrow">Notifications</p><h2>You stay in control</h2><p>{native ? 'Routine schedules are stored locally. The first Android release checks them while Vital is open; closed-app native scheduling is not enabled yet.' : 'Browser notification permission is optional. Routine reminder schedules are stored locally. Your operating system and browser control system notification behavior.'}</p></section>
      <section className="settings-section"><p className="eyebrow">Health data</p><h2>No step or medical-record access yet</h2><p>Vital does not currently read Apple HealthKit, Android Health Connect, wearable step data or medical records.</p></section>
      <section className="settings-section settings-privacy"><p className="eyebrow">Wellness scope</p><h2>Not medical treatment</h2><p>{APP_NAME} provides general wellness activities. Sleep check-ins are for self-reflection and are not sleep-disorder diagnosis or treatment. Gratitude practices may support well-being, but they are not a diagnosis or treatment and physical-health effects should not be assumed.</p></section>
    </main>
  )
}
