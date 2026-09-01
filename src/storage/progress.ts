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
