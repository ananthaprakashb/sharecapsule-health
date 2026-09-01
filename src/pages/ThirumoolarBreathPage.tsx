import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { thirumoolarBreath } from '../activities/thirumoolar'
import { recordCompletion } from '../storage/progress'

type ThirumoolarBreathPageProps = {
  onBack: () => void
}

export function ThirumoolarBreathPage({ onBack }: ThirumoolarBreathPageProps) {
  const activity = thirumoolarBreath
  const [running, setRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(activity.steps[0].seconds)
  const [cycles, setCycles] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef<number | null>(null)

  const step = activity.steps[stepIndex]
  const progress = useMemo(() => 1 - secondsLeft / step.seconds, [secondsLeft, step.seconds])

  useEffect(() => {
    if (!running) return

    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1)
      setSecondsLeft((value) => {
        if (value > 1) return value - 1

        const nextIndex = (stepIndex + 1) % activity.steps.length
        if (nextIndex === 0) setCycles((count) => count + 1)
        setStepIndex(nextIndex)
        return activity.steps[nextIndex].seconds
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activity.steps, running, stepIndex])

  function start() {
    if (!startedAt.current) startedAt.current = Date.now()
    setRunning(true)
  }

  function pause() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setStepIndex(0)
    setSecondsLeft(activity.steps[0].seconds)
    setCycles(0)
    setElapsed(0)
    startedAt.current = null
  }

  function finish() {
    if (elapsed >= 5) {
      recordCompletion({
        activityId: activity.id,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsed,
        cycles,
      })
    }
    reset()
    onBack()
  }

  return (
    <main className="practice-page">
      <header className="practice-header">
        <button className="icon-button" type="button" onClick={finish} aria-label="Return to Health home">←</button>
        <div>
          <p className="eyebrow">Breathe</p>
          <h1>{activity.title}</h1>
        </div>
        <span className="ratio-pill">1 : 4 : 2</span>
      </header>

      <section className="practice-card">
        <div className={`breath-orb breath-${step.id}`} aria-hidden="true">
          <div className="orb-inner" style={{ '--step-progress': `${progress}` } as CSSProperties}>
            <span>{secondsLeft}</span>
          </div>
        </div>

        <div className="step-copy" aria-live="polite">
          <p className="step-tamil">{step.tamilLabel}</p>
          <h2>{step.label}</h2>
          <p>{step.instruction}</p>
        </div>

        <div className="step-track" aria-label="Breathing sequence">
          {activity.steps.map((item, index) => (
            <div className={index === stepIndex ? 'step-chip active' : 'step-chip'} key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.seconds}s</span>
            </div>
          ))}
        </div>

        <div className="practice-meta">
          <div><strong>{cycles}</strong><span>cycles</span></div>
          <div><strong>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</strong><span>time</span></div>
        </div>

        <div className="practice-actions">
          <button className="secondary-button" type="button" onClick={reset}>Reset</button>
          {running ? (
            <button className="primary-button" type="button" onClick={pause}>Pause</button>
          ) : (
            <button className="primary-button" type="button" onClick={start}>{elapsed ? 'Continue' : 'Start breathing'}</button>
          )}
        </div>
      </section>

      <aside className="safety-note">
        <strong>Practice comfortably</strong>
        <p>{activity.safetyNote}</p>
      </aside>
    </main>
  )
}
