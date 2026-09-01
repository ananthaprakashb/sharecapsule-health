import type { ActivityCompletion } from '../types/activity'

const STORAGE_KEY = 'sharecapsule-health:completions'

export function readCompletions(): ActivityCompletion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActivityCompletion[]) : []
  } catch {
    return []
  }
}

export function recordCompletion(completion: ActivityCompletion) {
  const completions = [completion, ...readCompletions()].slice(0, 250)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completions))
}

export function getTodaySummary() {
  const today = new Date().toDateString()
  const completions = readCompletions().filter((item) => new Date(item.completedAt).toDateString() === today)
  const totalSeconds = completions.reduce((total, item) => total + item.durationSeconds, 0)

  return {
    activities: completions.length,
    minutes: Math.round(totalSeconds / 60),
  }
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getProgressSummary() {
  const completions = readCompletions()
  const totalSeconds = completions.reduce((total, item) => total + item.durationSeconds, 0)
  const activeDates = new Set(
    completions.map((item) => startOfLocalDay(new Date(item.completedAt)).getTime()),
  )

  let streak = 0
  const cursor = startOfLocalDay(new Date())
  while (activeDates.has(cursor.getTime())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = startOfLocalDay(new Date())
    date.setDate(date.getDate() - (6 - index))
    const key = date.toDateString()
    const dayCompletions = completions.filter(
      (item) => new Date(item.completedAt).toDateString() === key,
    )
    const seconds = dayCompletions.reduce((total, item) => total + item.durationSeconds, 0)

    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      activities: dayCompletions.length,
      minutes: Math.round(seconds / 60),
    }
  })

  return {
    totalActivities: completions.length,
    totalMinutes: Math.round(totalSeconds / 60),
    streak,
    week,
    recent: completions.slice(0, 10),
  }
}
