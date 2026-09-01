import { useEffect, useState } from 'react'
import type { HealthActivity } from '../types/activity'
import { recordCompletion } from '../storage/progress'

type TimedActivityPageProps = {
  activity: HealthActivity
  onBack: () => void
  onDone: () => void
  nextLabel?: string
  routineLabel?: string
}

export function TimedActivityPage({
  activity,
  onBack,
  onDone,
  nextLabel,
  routineLabel,
}: TimedActivityPageProps) {
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(activity.steps[0]?.seconds ?? 0)
  const [elapsed, setElapsed] = useState(0)

  const step = activity.steps[stepIndex]
  const totalSeconds = activity.steps.reduce((total, item) => total + item.seconds, 0)
  const progress = totalSeconds > 0 ? Math.min(1, elapsed / totalSeconds) : 0

  useEffect(() => {
    if (!running || completed || !step) return

    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1)
      setSecondsLeft((value) => {
        if (value > 1) return value - 1

        if (stepIndex < activity.steps.length - 1) {
          const nextIndex = stepIndex + 1
          setStepIndex(nextIndex)
          return activity.steps[nextIndex].seconds
        }

        const durationSeconds = Math.max(1, elapsed + 1)
        recordCompletion({
          activityId: activity.id,
          completedAt: new Date().toISOString(),
          durationSeconds,
        })
        setRunning(false)
        setCompleted(true)
        return 0
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activity.id, activity.steps, completed, elapsed, running, step, stepIndex])

  function reset() {
    setRunning(false)
    setCompleted(false)
    setStepIndex(0)
    setSecondsLeft(activity.steps[0]?.seconds ?? 0)
    setElapsed(0)
  }

  return (
    <main className="phase2-practice-page">
      <header className="phase2-practice-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Go back">←</button>
        <div>
          <p className="eyebrow">{routineLabel ?? activity.category}</p>
          <h1>{activity.title}</h1>
        </div>
        <span className="phase2-activity-icon" aria-hidden="true">{activity.icon}</span>
      </header>

      <section className="phase2-timer-card">
        <div className="phase2-progress-track" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>

        {completed ? (
          <div className="phase2-complete">
            <span aria-hidden="true">✓</span>
            <h2>Activity complete</h2>
            <p>{Math.max(1, Math.round(elapsed / 60))} minute{Math.round(elapsed / 60) === 1 ? '' : 's'} recorded on this device.</p>
            <button className="primary-button" type="button" onClick={onDone}>
              {nextLabel ?? 'Back to Health'}
            </button>
          </div>
        ) : (
          <>
            <div className="phase2-timer">
              <span>{secondsLeft}</span>
              <small>seconds</small>
            </div>

            <div className="phase2-step-copy" aria-live="polite">
              <p className="eyebrow">Step {stepIndex + 1} of {activity.steps.length}</p>
              <h2>{step?.label}</h2>
              <p>{step?.instruction}</p>
            </div>

            <div className="phase2-step-list" aria-label="Activity steps">
              {activity.steps.map((item, index) => (
                <div className={index === stepIndex ? 'active' : index < stepIndex ? 'done' : ''} key={item.id}>
                  <span>{index < stepIndex ? '✓' : index + 1}</span>
                  <strong>{item.label}</strong>
                  <small>{item.seconds}s</small>
                </div>
              ))}
            </div>

            <div className="phase2-actions">
              <button className="secondary-button" type="button" onClick={reset}>Reset</button>
              <button
                className="primary-button"
                type="button"
                onClick={() => setRunning((value) => !value)}
              >
                {running ? 'Pause' : elapsed > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          </>
        )}
      </section>

      <aside className="safety-note">
        <strong>Practice comfortably</strong>
        <p>{activity.safetyNote ?? 'Stop if the activity feels uncomfortable.'}</p>
      </aside>
    </main>
  )
}
