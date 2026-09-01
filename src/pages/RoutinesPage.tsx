import { useMemo, useState } from 'react'
import { getActivityById, timedActivities } from '../activities/library'
import { routinePresets } from '../routines/presets'
import { readCustomRoutine, saveCustomRoutine } from '../storage/preferences'

type RoutinesPageProps = {
  onBack: () => void
  onStartRoutine: (title: string, activityIds: string[]) => void
}

export function RoutinesPage({ onBack, onStartRoutine }: RoutinesPageProps) {
  const [selected, setSelected] = useState<string[]>(() => {
    const saved = readCustomRoutine()
    return saved.length ? saved : ['eye-rest', 'gentle-stretch']
  })

  const customDuration = useMemo(
    () => selected.reduce((total, id) => total + (getActivityById(id)?.durationMinutes ?? 0), 0),
    [selected],
  )

  function toggleActivity(id: string) {
    setSelected((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
      saveCustomRoutine(next)
      return next
    })
  }

  return (
    <main className="page-shell">
      <header className="subpage-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back to Health">←</button>
        <div>
          <p className="eyebrow">My routine</p>
          <h1>Routines</h1>
        </div>
      </header>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ready made</p>
            <h2>Choose a reset</h2>
          </div>
        </div>

        <div className="routine-grid">
          {routinePresets.map((routine) => {
            const duration = routine.activityIds.reduce(
              (total, id) => total + (getActivityById(id)?.durationMinutes ?? 0),
              0,
            )
            return (
              <article className="routine-card" key={routine.id}>
                <span className="routine-icon" aria-hidden="true">{routine.icon}</span>
                <div>
                  <h3>{routine.title}</h3>
                  <p>{routine.subtitle}</p>
                </div>
                <div className="routine-sequence">
                  {routine.activityIds.map((id) => (
                    <span key={id}>{getActivityById(id)?.title ?? id}</span>
                  ))}
                </div>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => onStartRoutine(routine.title, routine.activityIds)}
                >
                  Start · {duration} min
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section-block custom-routine-card">
        <p className="eyebrow">Build your own</p>
        <h2>Custom routine</h2>
        <p>Select activities. Your choices stay only on this device.</p>

        <div className="routine-builder">
          {timedActivities.map((activity) => (
            <label key={activity.id}>
              <input
                type="checkbox"
                checked={selected.includes(activity.id)}
                onChange={() => toggleActivity(activity.id)}
              />
              <span aria-hidden="true">{activity.icon}</span>
              <strong>{activity.title}</strong>
              <small>{activity.durationMinutes} min</small>
            </label>
          ))}
        </div>

        <button
          className="primary-button custom-routine-start"
          type="button"
          disabled={!selected.length}
          onClick={() => onStartRoutine('My custom routine', selected)}
        >
          Start my routine · {customDuration} min
        </button>
      </section>
    </main>
  )
}
