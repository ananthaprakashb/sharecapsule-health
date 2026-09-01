import { useState } from 'react'
import { timedActivities } from '../activities/library'
import { PwaInstallCard } from '../components/PwaInstallCard'
import { getConfiguredDuration, readGoals, saveActivityDuration, saveGoals } from '../storage/engagement'
import type { DailyGoals } from '../storage/engagement'
import { readSettings, saveSettings } from '../storage/settings'
import type { HealthSettings } from '../storage/settings'
import { playCue, triggerHaptic, unlockCueAudio } from '../utils/cues'

type SettingsPageProps = { onBack: () => void }

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState(readSettings)
  const [goals, setGoals] = useState(readGoals)
  const [durations, setDurations] = useState<Record<string, number>>(() => Object.fromEntries(timedActivities.map((activity) => [activity.id, getConfiguredDuration(activity)])))
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => 'Notification' in window ? Notification.permission : 'unsupported')

  function updateSetting<K extends keyof HealthSettings>(key: K, value: HealthSettings[K]) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
  }

  function updateGoal<K extends keyof DailyGoals>(key: K, value: number) {
    const next = saveGoals({ ...goals, [key]: value })
    setGoals(next)
  }

  function updateDuration(activityId: string, minutes: number) {
    const saved = saveActivityDuration(activityId, minutes)
    setDurations((current) => ({ ...current, [activityId]: saved }))
  }

  async function enableNotifications() {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
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
        <div><p className="eyebrow">On this device</p><h1>Settings</h1></div>
      </header>

      <section className="settings-section phase4-goal-settings">
        <p className="eyebrow">Targets</p><h2>Daily goals</h2>
        <p className="settings-intro">Use goals for motivation, not as a medical recommendation.</p>
        <label><span><strong>Minutes per day</strong><small>1–240 minutes</small></span><input type="number" min="1" max="240" value={goals.minutes} onChange={(event) => updateGoal('minutes', Number(event.target.value))} /></label>
        <label><span><strong>Activities per day</strong><small>1–20 completed activities</small></span><input type="number" min="1" max="20" value={goals.activities} onChange={(event) => updateGoal('activities', Number(event.target.value))} /></label>
      </section>

      <section className="settings-section">
        <p className="eyebrow">Activity length</p><h2>Default durations</h2>
        <p className="settings-intro">Timed activity steps scale proportionally to your selected total duration. Thirumoolar breathing keeps its own adjustable 1:4:2 control.</p>
        <div className="phase4-duration-list">
          {timedActivities.map((activity) => (
            <label key={activity.id}><span aria-hidden="true">{activity.icon}</span><strong>{activity.title}</strong><input type="number" min="1" max="60" value={durations[activity.id]} onChange={(event) => updateDuration(activity.id, Number(event.target.value))} /><small>min</small></label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <p className="eyebrow">Reminders</p><h2>Browser notifications</h2>
        <p className="settings-intro">Routine schedules are managed under Routines. The PWA checks them while it is active or when reopened. Reliable closed-app delivery requires push or native scheduling later.</p>
        <div className="phase4-permission-row"><span><strong>Notification permission</strong><small>{notificationPermission === 'unsupported' ? 'Not supported in this browser' : notificationPermission}</small></span><button type="button" onClick={enableNotifications} disabled={notificationPermission === 'unsupported' || notificationPermission === 'granted'}>{notificationPermission === 'granted' ? 'Enabled' : 'Enable'}</button></div>
      </section>

      <section className="settings-section">
        <p className="eyebrow">Guidance</p><h2>Sound & feedback</h2>
        <p className="settings-intro">Cues happen at meaningful transitions, not on every second or repetition.</p>
        <label className="setting-row"><span><strong>Guidance chimes</strong><small>Start and step-transition chimes for timed activities.</small></span><input type="checkbox" checked={settings.guidanceChimes} onChange={(event) => updateSetting('guidanceChimes', event.target.checked)} /></label>
        <label className="setting-row"><span><strong>Completion chime</strong><small>A short two-tone cue when an activity finishes.</small></span><input type="checkbox" checked={settings.completionChime} onChange={(event) => updateSetting('completionChime', event.target.checked)} /></label>
        <label className="setting-row"><span><strong>Vibration cues</strong><small>Use supported device vibration at transitions and completion.</small></span><input type="checkbox" checked={settings.vibrationCues} onChange={(event) => updateSetting('vibrationCues', event.target.checked)} /></label>
        <label className="setting-row"><span><strong>Keep screen awake</strong><small>Ask supported browsers to keep the screen visible while a timed activity is running.</small></span><input type="checkbox" checked={settings.keepScreenAwake} onChange={(event) => updateSetting('keepScreenAwake', event.target.checked)} /></label>
        <button className="settings-test-button" type="button" onClick={testCues} disabled={!settings.guidanceChimes && !settings.completionChime && !settings.vibrationCues}>Test enabled cues</button>
      </section>

      <section className="settings-section"><p className="eyebrow">Install</p><h2>Use it like an app</h2><PwaInstallCard /></section>
      <section className="settings-section settings-privacy"><p className="eyebrow">Privacy</p><h2>Local-first by default</h2><p>Your goals, favorites, routines, schedules, settings and activity history stay in this browser. No account is required for the PWA wellness experience.</p></section>
    </main>
  )
}
