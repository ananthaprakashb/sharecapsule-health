import { useRef, useState } from 'react'
import { restoreActivity } from '../activities/library'
import { APP_SHORT_NAME } from '../brand'
import { saveSleepEntry } from '../storage/foundations'
import type { SleepQuality } from '../storage/foundations'
import { recordCompletion } from '../storage/progress'

type RestorePageProps = { onBack: () => void; onDone: () => void; nextLabel?: string }
const qualities: Array<{ id: SleepQuality; label: string; icon: string }> = [
  { id: 'poor', label: 'Poor', icon: '😴' },
  { id: 'okay', label: 'Okay', icon: '🙂' },
  { id: 'good', label: 'Good', icon: '😊' },
  { id: 'restorative', label: 'Restorative', icon: '✨' },
]

export function RestorePage({ onBack, onDone, nextLabel }: RestorePageProps) {
  const [mode, setMode] = useState<'morning' | 'evening'>(() => new Date().getHours() < 12 ? 'morning' : 'evening')
  const [quality, setQuality] = useState<SleepQuality | null>(null)
  const [hours, setHours] = useState('')
  const [checks, setChecks] = useState({ lights: false, screens: false, tomorrow: false, breathe: false })
  const [done, setDone] = useState(false)
  const startedAtRef = useRef(Date.now())
  const savedRef = useRef(false)

  function save() {
    if (savedRef.current) return
    const createdAt = new Date().toISOString()
    const numericHours = Number(hours)
    saveSleepEntry({ id: `${Date.now()}-${mode}`, createdAt, phase: mode, quality: mode === 'morning' ? quality ?? undefined : undefined, hours: mode === 'morning' && numericHours > 0 && numericHours <= 24 ? numericHours : undefined })
    recordCompletion({ activityId: restoreActivity.id, completedAt: createdAt, durationSeconds: Math.max(30, Math.min(10 * 60, Math.round((Date.now() - startedAtRef.current) / 1000))) })
    savedRef.current = true
    setDone(true)
  }

  const completedChecks = Object.values(checks).filter(Boolean).length

  return <main className="page-shell phase9-focus-page">
    <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label={`Back to ${APP_SHORT_NAME}`}>←</button><div><p className="eyebrow">Restore · Sleep</p><h1>Restore</h1></div></header>
    <section className="phase9-feature-card phase9-restore-card"><span aria-hidden="true">🌙</span><div><h2>Support rest without chasing a perfect score.</h2><p>Use a quick morning check-in to notice sleep, or an evening wind-down to make rest easier to begin. Vital does not diagnose sleep conditions.</p></div></section>
    <div className="phase9-mode-tabs" role="group" aria-label="Restore mode"><button type="button" className={mode === 'morning' ? 'selected' : ''} disabled={done} onClick={() => setMode('morning')}>Morning check-in</button><button type="button" className={mode === 'evening' ? 'selected' : ''} disabled={done} onClick={() => setMode('evening')}>Evening wind-down</button></div>
    {mode === 'morning' ? <section className="settings-section"><p className="eyebrow">How was your sleep?</p><h2>Notice, don’t judge.</h2><div className="phase9-quality-grid">{qualities.map((item) => <button type="button" key={item.id} className={quality === item.id ? 'selected' : ''} disabled={done} onClick={() => setQuality(item.id)}><span>{item.icon}</span><strong>{item.label}</strong></button>)}</div><label className="phase9-field"><span><strong>Approximate sleep</strong><small>Optional. Enter what you remember; no precision required.</small></span><div className="phase9-hours"><input type="number" inputMode="decimal" min="0" max="24" step="0.25" value={hours} disabled={done} onChange={(event) => setHours(event.target.value)} /><span>hours</span></div></label>{!done ? <button className="primary-button phase9-wide-button" type="button" disabled={!quality && !hours} onClick={save}>Save sleep check-in</button> : null}</section> : <section className="settings-section"><p className="eyebrow">Wind down</p><h2>Make the next hour gentler.</h2><p className="settings-intro">Choose what is realistic tonight. This is a preparation ritual, not a sleep-performance test.</p><div className="phase9-checklist">{[
      ['lights', 'Dim the environment', 'Lower bright light if practical.'],
      ['screens', 'Reduce stimulating screen use', 'Put nonessential scrolling or work aside.'],
      ['tomorrow', 'Set down tomorrow’s tasks', 'Write one next step so your mind does not have to hold it.'],
      ['breathe', 'Take a quiet minute', 'Use easy breathing or stillness without forcing relaxation.'],
    ].map(([id, title, detail]) => <label key={id}><input type="checkbox" checked={checks[id as keyof typeof checks]} disabled={done} onChange={() => setChecks((current) => ({ ...current, [id]: !current[id as keyof typeof current] }))} /><span><strong>{title}</strong><small>{detail}</small></span></label>)}</div><p className="phase9-check-count">{completedChecks} of 4 prepared</p>{!done ? <button className="primary-button phase9-wide-button" type="button" onClick={save}>Finish wind-down</button> : null}</section>}
    {done ? <section className="phase9-complete-card"><span aria-hidden="true">✓</span><div><h2>{mode === 'morning' ? 'Sleep check-in saved' : 'Wind-down saved'}</h2><p>It counts toward today’s Restore foundation. One difficult night does not break a streak or reduce a score.</p></div><button className="primary-button" type="button" onClick={onDone}>{nextLabel ?? 'Done'}</button></section> : null}
  </main>
}
