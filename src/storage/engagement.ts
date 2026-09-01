import type { HealthActivity } from '../types/activity'

const GOALS_KEY = 'sharecapsule-health:goals'
const DURATIONS_KEY = 'sharecapsule-health:durations'
const SCHEDULES_KEY = 'sharecapsule-health:routine-schedules'

export type DailyGoals = {
  minutes: number
  activities: number
}

export type RoutineSchedule = {
  id: string
  title: string
  activityIds: string[]
  time: string
  days: number[]
  enabled: boolean
  lastNotifiedKey?: string
}

const DEFAULT_GOALS: DailyGoals = { minutes: 10, activities: 1 }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export function readGoals(): DailyGoals {
  const stored = readJson<Partial<DailyGoals>>(GOALS_KEY, {})
  return {
    minutes: clamp(Number(stored.minutes ?? DEFAULT_GOALS.minutes), 1, 240),
    activities: clamp(Number(stored.activities ?? DEFAULT_GOALS.activities), 1, 20),
  }
}

export function saveGoals(goals: DailyGoals) {
  const next = {
    minutes: clamp(goals.minutes, 1, 240),
    activities: clamp(goals.activities, 1, 20),
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(next))
  return next
}

export function readDurationOverrides(): Record<string, number> {
  const value = readJson<Record<string, number>>(DURATIONS_KEY, {})
  return Object.fromEntries(
    Object.entries(value).filter(([, minutes]) => Number.isFinite(minutes) && minutes >= 1 && minutes <= 60),
  )
}

export function getConfiguredDuration(activity: HealthActivity) {
  if (activity.slug === 'thirumoolar') return activity.durationMinutes
  return readDurationOverrides()[activity.id] ?? activity.durationMinutes
}

export function saveActivityDuration(activityId: string, minutes: number) {
  const overrides = readDurationOverrides()
  overrides[activityId] = clamp(minutes, 1, 60)
  localStorage.setItem(DURATIONS_KEY, JSON.stringify(overrides))
  return overrides[activityId]
}

export function withConfiguredDuration(activity: HealthActivity): HealthActivity {
  const targetMinutes = getConfiguredDuration(activity)
  if (targetMinutes === activity.durationMinutes || !activity.steps.length) return activity

  const sourceTotal = activity.steps.reduce((total, step) => total + step.seconds, 0)
  const targetTotal = targetMinutes * 60
  let allocated = 0

  const steps = activity.steps.map((step, index) => {
    if (index === activity.steps.length - 1) {
      return { ...step, seconds: Math.max(5, targetTotal - allocated) }
    }

    const seconds = Math.max(5, Math.round((step.seconds / sourceTotal) * targetTotal))
    allocated += seconds
    return { ...step, seconds }
  })

  return { ...activity, durationMinutes: targetMinutes, steps }
}

export function readRoutineSchedules(): RoutineSchedule[] {
  const schedules = readJson<RoutineSchedule[]>(SCHEDULES_KEY, [])
  if (!Array.isArray(schedules)) return []
  return schedules.filter((schedule) =>
    schedule &&
    typeof schedule.id === 'string' &&
    typeof schedule.title === 'string' &&
    Array.isArray(schedule.activityIds) &&
    typeof schedule.time === 'string' &&
    Array.isArray(schedule.days),
  )
}

function writeSchedules(schedules: RoutineSchedule[]) {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules))
  return schedules
}

export function addRoutineSchedule(schedule: Omit<RoutineSchedule, 'id' | 'lastNotifiedKey'>) {
  const id = globalThis.crypto?.randomUUID?.() ?? `schedule-${Date.now()}`
  return writeSchedules([...readRoutineSchedules(), { ...schedule, id }])
}

export function updateRoutineSchedule(id: string, patch: Partial<RoutineSchedule>) {
  return writeSchedules(readRoutineSchedules().map((schedule) => schedule.id === id ? { ...schedule, ...patch, id } : schedule))
}

export function deleteRoutineSchedule(id: string) {
  return writeSchedules(readRoutineSchedules().filter((schedule) => schedule.id !== id))
}

export function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isScheduleDue(schedule: RoutineSchedule, now = new Date()) {
  if (!schedule.enabled || !schedule.days.includes(now.getDay())) return false
  const [hours, minutes] = schedule.time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false

  const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
  const elapsed = now.getTime() - scheduled.getTime()
  const key = localDateKey(now)

  return elapsed >= 0 && elapsed <= 2 * 60 * 60 * 1000 && schedule.lastNotifiedKey !== key
}

export function markScheduleNotified(id: string, date = new Date()) {
  return updateRoutineSchedule(id, { lastNotifiedKey: localDateKey(date) })
}
