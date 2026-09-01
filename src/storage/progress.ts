import type { ActivityCompletion } from '../types/activity'
import { readGoals } from './engagement'

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
  const completions = [completion, ...readCompletions()].slice(0, 500)
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

function calculateCurrentStreak(activeDates: Set<number>) {
  const today = startOfLocalDay(new Date())
  const cursor = new Date(today)
  if (!activeDates.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (activeDates.has(cursor.getTime())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function calculateBestStreak(activeDates: Set<number>) {
  const dates = [...activeDates].sort((a, b) => a - b)
  let best = 0
  let current = 0
  let previous: number | null = null
  const oneDay = 24 * 60 * 60 * 1000

  dates.forEach((time) => {
    current = previous !== null && Math.round((time - previous) / oneDay) === 1 ? current + 1 : 1
    best = Math.max(best, current)
    previous = time
  })

  return best
}

export function getProgressSummary() {
  const completions = readCompletions()
  const goals = readGoals()
  const totalSeconds = completions.reduce((total, item) => total + item.durationSeconds, 0)
  const activeDates = new Set(completions.map((item) => startOfLocalDay(new Date(item.completedAt)).getTime()))

  const byDay = new Map<string, ActivityCompletion[]>()
  completions.forEach((item) => {
    const key = new Date(item.completedAt).toDateString()
    byDay.set(key, [...(byDay.get(key) ?? []), item])
  })

  const goalDays = [...byDay.values()].filter((items) => {
    const minutes = Math.round(items.reduce((total, item) => total + item.durationSeconds, 0) / 60)
    return items.length >= goals.activities && minutes >= goals.minutes
  }).length

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = startOfLocalDay(new Date())
    date.setDate(date.getDate() - (6 - index))
    const key = date.toDateString()
    const dayCompletions = byDay.get(key) ?? []
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
    streak: calculateCurrentStreak(activeDates),
    bestStreak: calculateBestStreak(activeDates),
    goalDays,
    week,
    recent: completions.slice(0, 12),
  }
}
