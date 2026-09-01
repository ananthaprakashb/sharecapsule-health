import { useMemo, useState } from 'react'
import { getActivityById, timedActivities } from '../activities/library'
import { routinePresets } from '../routines/presets'
import { addRoutineSchedule, deleteRoutineSchedule, getConfiguredDuration, readRoutineSchedules, updateRoutineSchedule } from '../storage/engagement'
import type { RoutineSchedule } from '../storage/engagement'
import { readCustomRoutine, saveCustomRoutine } from '../storage/preferences'

type RoutinesPageProps = {
  onBack: () => void
  onStartRoutine: (title: string, activityIds: string[]) => void
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function RoutinesPage({ onBack, onStartRoutine }: RoutinesPageProps) {
  const [selected, setSelected] = useState<string[]>(() => {
    const saved = readCustomRoutine()
    return saved.length ? saved : ['eye-rest', 'gentle-stretch']
  })
  const [schedules, setSchedules] = useState<RoutineSchedule[]>(readRoutineSchedules)
  const [scheduleTarget, setScheduleTarget] = useState(routinePresets[0]?.id ?? 'custom')
  const [scheduleTime, setScheduleTime] = useState('08:00')
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5])

  const durationFor = (ids: string[]) => ids.reduce((total, id) => {
    const activity = getActivityById(id)
    return total + (activity ? getConfiguredDuration(activity) : 0)
  }, 0)

  const customDuration = useMemo(() => durationFor(selected), [selected])

  function toggleActivity(id: string) {
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      saveCustomRoutine(next)
      return next
    })
  }

  function toggleScheduleDay(day: number) {
    setScheduleDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort())
  }

  function createSchedule() {
    const preset = routinePresets.find((item) => item.id === scheduleTarget)
    const activityIds = preset ? preset.activityIds : selected
    const title = preset ? preset.title : 'My custom routine'
    if (!activityIds.length || !scheduleDays.length) return

    setSchedules(addRoutineSchedule({ title, activityIds, time: scheduleTime, days: scheduleDays, enabled: true }))
  }

  function toggleSchedule(schedule: RoutineSchedule) {
    setSchedules(updateRoutineSchedule(schedule.id, { enabled: !schedule.enabled }))
  }

  return (
    <main className="page-shell">
      <header className="subpage-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back to Health">←</button>
        <div><p className="eyebrow">My routine</p><h1>Routines</h1></div>
      </header>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Ready made</p><h2>Choose a reset</h2></div></div>
        <div className="routine-grid">
          {routinePresets.map((routine) => (
            <article className="routine-card" key={routine.id}>
              <span className="routine-icon" aria-hidden="true">{routine.icon}</span>
              <div><h3>{routine.title}</h3><p>{routine.subtitle}</p></div>
              <div className="routine-sequence">{routine.activityIds.map((id) => <span key={id}>{getActivityById(id)?.title ?? id}</span>)}</div>
              <button className="primary-button" type="button" onClick={() => onStartRoutine(routine.title, routine.activityIds)}>Start · {durationFor(routine.activityIds)} min</button>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block custom-routine-card">
        <p className="eyebrow">Build your own</p><h2>Custom routine</h2><p>Select activities. Your choices stay only on this device.</p>
        <div className="routine-builder">
          {timedActivities.map((activity) => (
            <label key={activity.id}><input type="checkbox" checked={selected.includes(activity.id)} onChange={() => toggleActivity(activity.id)} /><span aria-hidden="true">{activity.icon}</span><strong>{activity.title}</strong><small>{getConfiguredDuration(activity)} min</small></label>
          ))}
        </div>
        <button className="primary-button custom-routine-start" type="button" disabled={!selected.length} onClick={() => onStartRoutine('My custom routine', selected)}>Start my routine · {customDuration} min</button>
      </section>

      <section className="section-block phase4-schedule-card">
        <p className="eyebrow">Routine reminders</p><h2>Schedule your rhythm</h2>
        <p>Local schedules are checked while the PWA is active or when you reopen it.</p>
        <div className="phase4-schedule-form">
          <label><span>Routine</span><select value={scheduleTarget} onChange={(event) => setScheduleTarget(event.target.value)}>{routinePresets.map((routine) => <option value={routine.id} key={routine.id}>{routine.title}</option>)}<option value="custom">My custom routine</option></select></label>
          <label><span>Time</span><input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} /></label>
        </div>
        <div className="phase4-days" aria-label="Reminder days">{dayLabels.map((label, day) => <button type="button" key={`${label}-${day}`} className={scheduleDays.includes(day) ? 'active' : ''} aria-pressed={scheduleDays.includes(day)} onClick={() => toggleScheduleDay(day)}>{label}</button>)}</div>
        <button className="primary-button phase4-add-schedule" type="button" disabled={!scheduleDays.length || (scheduleTarget === 'custom' && !selected.length)} onClick={createSchedule}>Add reminder</button>

        {schedules.length ? <div className="phase4-schedule-list">{schedules.map((schedule) => (
          <article key={schedule.id}>
            <div><strong>{schedule.title}</strong><small>{schedule.time} · {schedule.days.map((day) => dayLabels[day]).join(' ')}</small></div>
            <button type="button" className={schedule.enabled ? 'active' : ''} onClick={() => toggleSchedule(schedule)}>{schedule.enabled ? 'On' : 'Off'}</button>
            <button type="button" aria-label={`Delete ${schedule.title} reminder`} onClick={() => setSchedules(deleteRoutineSchedule(schedule.id))}>×</button>
          </article>
        ))}</div> : <p className="empty-copy">No routine reminders yet.</p>}
      </section>
    </main>
  )
}
