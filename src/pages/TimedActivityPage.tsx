import { useEffect, useMemo, useRef, useState } from 'react'
import type { HealthActivity } from '../types/activity'
import { withConfiguredDuration } from '../storage/engagement'
import { recordCompletion } from '../storage/progress'
import { readSettings } from '../storage/settings'
import { playCue, triggerHaptic, unlockCueAudio } from '../utils/cues'

type TimedActivityPageProps = {
  activity: HealthActivity
  onBack: () => void
  onDone: () => void
  nextLabel?: string
  routineLabel?: string
}

type WakeLockSentinelLike = { released?: boolean; release: () => Promise<void> }
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }

export function TimedActivityPage({ activity, onBack, onDone, nextLabel, routineLabel }: TimedActivityPageProps) {
  const practiceActivity = useMemo(() => withConfiguredDuration(activity), [activity])
  const settings = useMemo(readSettings, [])
  const totalMs = useMemo(() => practiceActivity.steps.reduce((total, item) => total + item.seconds * 1000, 0), [practiceActivity.steps])
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(practiceActivity.steps[0]?.seconds ?? 0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const runningRef = useRef(false)
  const completedRef = useRef(false)
  const completionRecordedRef = useRef(false)
  const stepIndexRef = useRef(0)
  const elapsedMsRef = useRef(0)
  const lastTickRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null)
  const step = practiceActivity.steps[stepIndex]
  const progress = totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 0

  async function requestWakeLock() {
    if (!settings.keepScreenAwake || document.hidden || wakeLockRef.current) return
    const wakeLockNavigator = navigator as WakeLockNavigator
    if (!wakeLockNavigator.wakeLock) return
    try { wakeLockRef.current = await wakeLockNavigator.wakeLock.request('screen') } catch { wakeLockRef.current = null }
  }

  function releaseWakeLock() {
    const current = wakeLockRef.current
    wakeLockRef.current = null
    if (current) void current.release().catch(() => undefined)
  }

  function clearTimer() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  function locateStep(currentElapsedMs: number) {
    let cursor = 0
    for (let index = 0; index < practiceActivity.steps.length; index += 1) {
      const end = cursor + practiceActivity.steps[index].seconds * 1000
      if (currentElapsedMs < end) return { index, remainingMs: end - currentElapsedMs }
      cursor = end
    }
    return { index: Math.max(0, practiceActivity.steps.length - 1), remainingMs: 0 }
  }

  function completeActivity() {
    if (completedRef.current) return
    completedRef.current = true
    runningRef.current = false
    setRunning(false)
    setCompleted(true)
    elapsedMsRef.current = totalMs
    setElapsedMs(totalMs)
    setSecondsLeft(0)
    clearTimer()
    releaseWakeLock()
    if (!completionRecordedRef.current) {
      completionRecordedRef.current = true
      recordCompletion({ activityId: practiceActivity.id, completedAt: new Date().toISOString(), durationSeconds: Math.max(1, Math.round(totalMs / 1000)) })
    }
    if (settings.completionChime) void playCue('complete')
    if (settings.vibrationCues) triggerHaptic('complete')
  }

  function syncTimer(now: number) {
    if (!runningRef.current || completedRef.current) return
    if (lastTickRef.current !== null) elapsedMsRef.current += Math.max(0, now - lastTickRef.current)
    lastTickRef.current = now
    if (elapsedMsRef.current >= totalMs) { completeActivity(); return }
    const located = locateStep(elapsedMsRef.current)
    if (located.index !== stepIndexRef.current) {
      stepIndexRef.current = located.index
      setStepIndex(located.index)
      if (settings.guidanceChimes) void playCue('transition')
      if (settings.vibrationCues) triggerHaptic('transition')
    }
    setElapsedMs(elapsedMsRef.current)
    setSecondsLeft(Math.max(1, Math.ceil(located.remainingMs / 1000)))
  }

  async function start() {
    if (runningRef.current || completedRef.current) return
    const firstStart = elapsedMsRef.current === 0
    if (settings.guidanceChimes || settings.completionChime) await unlockCueAudio()
    if (firstStart && settings.guidanceChimes) void playCue('start')
    if (firstStart && settings.vibrationCues) triggerHaptic('start')
    runningRef.current = true
    setRunning(true)
    lastTickRef.current = performance.now()
    if (timerRef.current === null) timerRef.current = window.setInterval(() => syncTimer(performance.now()), 100)
    void requestWakeLock()
  }

  function pause() {
    if (!runningRef.current) return
    syncTimer(performance.now())
    runningRef.current = false
    setRunning(false)
    lastTickRef.current = null
    clearTimer()
    releaseWakeLock()
  }

  function reset() {
    runningRef.current = false
    completedRef.current = false
    completionRecordedRef.current = false
    elapsedMsRef.current = 0
    lastTickRef.current = null
    stepIndexRef.current = 0
    clearTimer()
    releaseWakeLock()
    setRunning(false)
    setCompleted(false)
    setStepIndex(0)
    setSecondsLeft(practiceActivity.steps[0]?.seconds ?? 0)
    setElapsedMs(0)
  }

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) { releaseWakeLock(); return }
      if (runningRef.current) { syncTimer(performance.now()); void requestWakeLock() }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => { document.removeEventListener('visibilitychange', onVisibilityChange); runningRef.current = false; clearTimer(); releaseWakeLock() }
  }, [])

  const recordedMinutes = Math.max(1, Math.round(totalMs / 60000))

  return (
    <main className="phase2-practice-page phase3-timed-page">
      <header className="phase2-practice-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Go back">←</button>
        <div><p className="eyebrow">{routineLabel ?? practiceActivity.category}</p><h1>{practiceActivity.title}</h1></div>
        <span className="phase2-activity-icon" aria-hidden="true">{practiceActivity.icon}</span>
      </header>
      <section className="phase2-timer-card">
        <div className="phase2-progress-track" role="progressbar" aria-label={`${practiceActivity.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><span style={{ width: `${progress * 100}%` }} /></div>
        {completed ? (
          <div className="phase2-complete" aria-live="polite"><span aria-hidden="true">✓</span><h2>Activity complete</h2><p>{recordedMinutes} minute{recordedMinutes === 1 ? '' : 's'} saved locally on this device.</p>{routineLabel ? <small className="phase3-routine-complete">{routineLabel}</small> : null}<button className="primary-button" type="button" onClick={onDone}>{nextLabel ?? 'Back to Health'}</button></div>
        ) : (
          <><div className="phase2-timer" aria-live="polite" aria-atomic="true"><span>{secondsLeft}</span><small>seconds</small></div><div className="phase2-step-copy"><p className="eyebrow">Step {stepIndex + 1} of {practiceActivity.steps.length}</p><h2>{step?.label}</h2><p>{step?.instruction}</p></div><div className="phase2-step-list" aria-label="Activity steps">{practiceActivity.steps.map((item, index) => <div className={index === stepIndex ? 'active' : index < stepIndex ? 'done' : ''} key={item.id}><span>{index < stepIndex ? '✓' : index + 1}</span><strong>{item.label}</strong><small>{item.seconds}s</small></div>)}</div><div className="phase2-actions"><button className="secondary-button" type="button" onClick={reset}>Reset</button><button className="primary-button" type="button" onClick={running ? pause : start}>{running ? 'Pause' : elapsedMs > 0 ? 'Continue' : 'Start'}</button></div></>
        )}
      </section>
      <aside className="safety-note"><strong>Practice comfortably</strong><p>{practiceActivity.safetyNote ?? 'Stop if the activity feels uncomfortable.'}</p></aside>
    </main>
  )
}
