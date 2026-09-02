import { useEffect, useRef, useState } from 'react'
import { readingActivity } from '../activities/library'
import { APP_SHORT_NAME } from '../brand'
import { saveLearningReflection } from '../storage/foundations'
import { recordCompletion } from '../storage/progress'

type ReadingPageProps = {
  onBack: () => void
  onDone: () => void
  onStartRecall: () => void
  nextLabel?: string
}

const choices = [5, 10, 20]

export function ReadingPage({ onBack, onDone, onStartRecall, nextLabel }: ReadingPageProps) {
  const [minutes, setMinutes] = useState(10)
  const [topic, setTopic] = useState('')
  const [takeaway, setTakeaway] = useState('')
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [completed, setCompleted] = useState(false)
  const [status, setStatus] = useState('')
  const startedAtRef = useRef(0)
  const endsAtRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const completionSavedRef = useRef(false)
  const reflectionSavedRef = useRef(false)

  function clearTimer() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  function finishReading() {
    if (completionSavedRef.current) return
    const elapsed = startedAtRef.current ? Math.max(30, Math.round((Date.now() - startedAtRef.current) / 1000)) : minutes * 60
    clearTimer()
    setRunning(false)
    setSecondsLeft(0)
    setCompleted(true)
    completionSavedRef.current = true
    recordCompletion({ activityId: readingActivity.id, completedAt: new Date().toISOString(), durationSeconds: Math.min(minutes * 60, elapsed) })
    setStatus('Reading moment saved. Before looking back, try recalling what you remember.')
  }

  function saveReflection() {
    if (reflectionSavedRef.current || (!topic.trim() && !takeaway.trim())) return
    saveLearningReflection({ id: `${Date.now()}-reading`, createdAt: new Date().toISOString(), kind: 'reading', topic: topic.trim() || undefined, keyIdea: takeaway.trim() || undefined })
    reflectionSavedRef.current = true
  }

  function continueToRecall() { saveReflection(); onStartRecall() }
  function finishPage() { saveReflection(); onDone() }

  function startReading() {
    if (running || completed) return
    const duration = Math.max(1, Math.min(60, minutes)) * 60
    startedAtRef.current = Date.now()
    endsAtRef.current = startedAtRef.current + duration * 1000
    setSecondsLeft(duration)
    setRunning(true)
    setStatus('Read with one goal: understand something worth remembering.')
    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) finishReading()
    }, 500)
  }

  useEffect(() => () => clearTimer(), [])

  const displayMinutes = Math.floor(secondsLeft / 60)
  const displaySeconds = String(secondsLeft % 60).padStart(2, '0')

  return <main className="page-shell phase9-focus-page">
    <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label={`Back to ${APP_SHORT_NAME}`}>←</button><div><p className="eyebrow">Learn · Reading</p><h1>Read intentionally</h1></div></header>
    <section className="phase9-feature-card"><span aria-hidden="true">📖</span><div><h2>Read to understand, not just to finish.</h2><p>Choose a short block of time. When you finish, capture one idea worth remembering and try Active Recall without looking at the source.</p></div></section>
    <section className="settings-section"><p className="eyebrow">Set your focus</p><h2>What are you reading?</h2><input className="phase9-text-input" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={120} placeholder="Optional: book, article, chapter or topic" disabled={running || completed} />
      <div className="phase9-duration-grid">{choices.map((choice) => <button type="button" key={choice} className={minutes === choice ? 'selected' : ''} disabled={running || completed} onClick={() => { setMinutes(choice); setSecondsLeft(choice * 60) }}>{choice} min</button>)}</div>
      <label className="phase9-custom-duration"><span>Custom minutes</span><input type="number" min="1" max="60" value={minutes} disabled={running || completed} onChange={(event) => { const value = Math.max(1, Math.min(60, Number(event.target.value) || 1)); setMinutes(value); setSecondsLeft(value * 60) }} /></label>
    </section>
    <section className="settings-section phase9-timer-card"><p className="eyebrow">Reading block</p><div className="phase9-big-timer" aria-live="polite">{displayMinutes}:{displaySeconds}</div><p>Keep the source open while reading. When the timer ends, close it before recalling.</p>{!running && !completed ? <button className="primary-button" type="button" onClick={startReading}>Start reading</button> : null}{running ? <button className="primary-button" type="button" onClick={finishReading}>Finish reading</button> : null}</section>
    {completed ? <section className="settings-section"><p className="eyebrow">One idea</p><h2>What is worth remembering?</h2><textarea className="phase9-textarea" rows={4} value={takeaway} onChange={(event) => setTakeaway(event.target.value)} maxLength={600} placeholder="Optional. Keep it short—the recall exercise comes next." /><p className="phase6-status" role="status">{status}</p><div className="phase9-actions">{nextLabel ? <button className="primary-button" type="button" onClick={finishPage}>{nextLabel}</button> : <><button className="primary-button" type="button" onClick={continueToRecall}>Try Active Recall</button><button type="button" onClick={finishPage}>Done for now</button></>}</div></section> : status ? <p className="phase6-status" role="status">{status}</p> : null}
  </main>
}
