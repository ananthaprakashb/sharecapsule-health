import { useState } from 'react'
import { PwaInstallCard } from '../components/PwaInstallCard'
import { readSettings, saveSettings } from '../storage/settings'
import type { HealthSettings } from '../storage/settings'
import { playCue, triggerHaptic, unlockCueAudio } from '../utils/cues'

type SettingsPageProps = {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState(readSettings)

  function updateSetting<K extends keyof HealthSettings>(key: K, value: HealthSettings[K]) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
  }

  async function testCues() {
    if (settings.guidanceChimes || settings.completionChime) {
      await unlockCueAudio()
      await playCue('transition')
    }
    if (settings.vibrationCues) triggerHaptic('transition')
  }

  return (
    <main className="page-shell settings-page">
      <header className="subpage-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back to Health">←</button>
        <div>
          <p className="eyebrow">On this device</p>
          <h1>Settings</h1>
        </div>
      </header>

      <section className="settings-section">
        <p className="eyebrow">Guidance</p>
        <h2>Sound & feedback</h2>
        <p className="settings-intro">Cues happen at meaningful transitions, not on every second or repetition.</p>

        <label className="setting-row">
          <span><strong>Guidance chimes</strong><small>Start and step-transition chimes for timed activities.</small></span>
          <input type="checkbox" checked={settings.guidanceChimes} onChange={(event) => updateSetting('guidanceChimes', event.target.checked)} />
        </label>
        <label className="setting-row">
          <span><strong>Completion chime</strong><small>A short two-tone cue when an activity finishes.</small></span>
          <input type="checkbox" checked={settings.completionChime} onChange={(event) => updateSetting('completionChime', event.target.checked)} />
        </label>
        <label className="setting-row">
          <span><strong>Vibration cues</strong><small>Use supported device vibration at transitions and completion.</small></span>
          <input type="checkbox" checked={settings.vibrationCues} onChange={(event) => updateSetting('vibrationCues', event.target.checked)} />
        </label>
        <label className="setting-row">
          <span><strong>Keep screen awake</strong><small>Ask supported browsers to keep the screen visible while a timed activity is running.</small></span>
          <input type="checkbox" checked={settings.keepScreenAwake} onChange={(event) => updateSetting('keepScreenAwake', event.target.checked)} />
        </label>

        <button className="settings-test-button" type="button" onClick={testCues} disabled={!settings.guidanceChimes && !settings.completionChime && !settings.vibrationCues}>
          Test enabled cues
        </button>
      </section>

      <section className="settings-section">
        <p className="eyebrow">Install</p>
        <h2>Use it like an app</h2>
        <PwaInstallCard />
      </section>

      <section className="settings-section settings-privacy">
        <p className="eyebrow">Privacy</p>
        <h2>Local-first by default</h2>
        <p>Your favorites, routines, settings and activity history stay in this browser. No account is required for the PWA wellness experience.</p>
      </section>
    </main>
  )
}
