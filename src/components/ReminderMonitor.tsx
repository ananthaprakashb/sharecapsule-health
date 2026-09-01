import { useEffect, useState } from 'react'
import { isScheduleDue, markScheduleNotified, readRoutineSchedules } from '../storage/engagement'
import type { RoutineSchedule } from '../storage/engagement'
import { readSettings } from '../storage/settings'
import { playCue } from '../utils/cues'

async function showSystemReminder(schedule: RoutineSchedule, silent = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  try {
    const registration = await navigator.serviceWorker?.ready
    if (registration) {
      await registration.showNotification(`Time for ${schedule.title}`, {
        body: 'Your scheduled ShareCapsule Health routine is ready.',
        icon: '/icon-192.png',
        tag: `routine-${schedule.id}`,
        silent,
        data: { url: '/#/routines' },
      })
      return
    }

    new Notification(`Time for ${schedule.title}`, {
      body: 'Your scheduled ShareCapsule Health routine is ready.',
      icon: '/icon-192.png',
      tag: `routine-${schedule.id}`,
      silent,
    })
  } catch {
    // The in-app reminder remains available when system notifications fail.
  }
}

export function ReminderMonitor() {
  const [due, setDue] = useState<RoutineSchedule | null>(null)

  useEffect(() => {
    function check() {
      const schedule = readRoutineSchedules().find((item) => isScheduleDue(item))
      if (!schedule) return

      markScheduleNotified(schedule.id)
      setDue(schedule)

      const settings = readSettings()
      const playInAppChime = settings.reminderChime && !document.hidden
      void showSystemReminder(schedule, playInAppChime)
      if (playInAppChime) void playCue('reminder')
    }

    check()
    const timer = window.setInterval(check, 30_000)
    const onVisibility = () => {
      if (!document.hidden) check()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  if (!due) return null

  return (
    <div className="phase4-reminder" role="status">
      <span aria-hidden="true">⏰</span>
      <div>
        <strong>{due.title}</strong>
        <small>Your scheduled routine is ready.</small>
      </div>
      <button type="button" onClick={() => { setDue(null); window.location.hash = '/routines' }}>Open</button>
      <button type="button" className="phase4-reminder-dismiss" aria-label="Dismiss reminder" onClick={() => setDue(null)}>×</button>
    </div>
  )
}
