import { getActivityById } from '../activities/library'
import { readGoals } from '../storage/engagement'
import { getProgressSummary, readCompletions } from '../storage/progress'
import type { AiSharePreferences, ProgressPeriod } from '../storage/aiPreferences'

export const PROGRESS_SCHEMA = 'sharecapsule.health.progress.v1'

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function periodStart(period: ProgressPeriod, now: Date) {
  if (period === 'all') return null
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === '7days') start.setDate(start.getDate() - 6)
  if (period === '30days') start.setDate(start.getDate() - 29)
  return start
}

function periodLabel(period: ProgressPeriod) {
  if (period === 'today') return 'Today'
  if (period === '7days') return 'Last 7 days'
  if (period === '30days') return 'Last 30 days'
  return 'All locally stored history'
}

export function buildProgressEnvelope(preferences: AiSharePreferences) {
  const now = new Date()
  const start = periodStart(preferences.period, now)
  const completions = readCompletions().filter((item) => !start || new Date(item.completedAt) >= start)
  const totalSeconds = completions.reduce((total, item) => total + item.durationSeconds, 0)
  const activeDays = new Set(completions.map((item) => localDateKey(new Date(item.completedAt))))
  const progress = getProgressSummary()
  const goals = readGoals()

  const dailyMap = new Map<string, { activities: number; seconds: number }>()
  completions.forEach((item) => {
    const key = localDateKey(new Date(item.completedAt))
    const current = dailyMap.get(key) ?? { activities: 0, seconds: 0 }
    dailyMap.set(key, { activities: current.activities + 1, seconds: current.seconds + item.durationSeconds })
  })

  const daily = preferences.includeDailyBreakdown
    ? [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({
        date,
        activities: value.activities,
        minutes: Math.round(value.seconds / 60),
      }))
    : undefined

  const recent = preferences.includeRecentActivities
    ? completions.slice(0, 10).map((item) => {
        const completed = new Date(item.completedAt)
        return {
          activity: getActivityById(item.activityId)?.title ?? item.activityId,
          completed: preferences.includeExactTimes ? completed.toISOString() : localDateKey(completed),
          minutes: Math.max(1, Math.round(item.durationSeconds / 60)),
        }
      })
    : undefined

  return {
    schema: PROGRESS_SCHEMA,
    generatedAt: now.toISOString(),
    source: {
      app: 'ShareCapsule Health',
      mode: 'local-pwa',
    },
    period: {
      kind: preferences.period,
      label: periodLabel(preferences.period),
      from: start ? localDateKey(start) : null,
      through: localDateKey(now),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local',
    },
    summary: {
      activities: completions.length,
      minutes: Math.round(totalSeconds / 60),
      activeDays: activeDays.size,
    },
    goals: preferences.includeGoals ? {
      dailyMinutes: goals.minutes,
      dailyActivities: goals.activities,
      goalDays: progress.goalDays,
    } : undefined,
    streaks: preferences.includeStreaks ? {
      currentDays: progress.streak,
      bestDays: progress.bestStreak,
    } : undefined,
    daily,
    recent,
    privacy: {
      userInitiatedShare: true,
      containsRawHealthPlatformRecords: false,
      containsMedicalRecords: false,
    },
  }
}

export type ProgressEnvelope = ReturnType<typeof buildProgressEnvelope>

export function formatProgressForAi(envelope: ProgressEnvelope, destinationLabel: string) {
  const lines = [
    'ShareCapsule Health progress update',
    `Preferred assistant/app: ${destinationLabel}`,
    `Period: ${envelope.period.label}`,
    '',
    `Completed activities: ${envelope.summary.activities}`,
    `Practice minutes: ${envelope.summary.minutes}`,
    `Active days: ${envelope.summary.activeDays}`,
  ]

  if (envelope.streaks) {
    lines.push(`Current streak: ${envelope.streaks.currentDays} day(s)`, `Best streak: ${envelope.streaks.bestDays} day(s)`)
  }
  if (envelope.goals) {
    lines.push(`Daily goals: ${envelope.goals.dailyMinutes} minutes and ${envelope.goals.dailyActivities} activities`, `Days both goals reached: ${envelope.goals.goalDays}`)
  }
  if (envelope.daily?.length) {
    lines.push('', 'Daily breakdown:')
    envelope.daily.forEach((day) => lines.push(`- ${day.date}: ${day.activities} activities, ${day.minutes} minutes`))
  }
  if (envelope.recent?.length) {
    lines.push('', 'Recent activities:')
    envelope.recent.forEach((item) => lines.push(`- ${item.completed}: ${item.activity}, ${item.minutes} min`))
  }

  lines.push(
    '',
    'Please use this as my wellness progress update. Help me track consistency, recognize progress, and suggest a small next step. Do not infer diagnoses or treat this as medical-record data.',
    '',
    `Data schema: ${envelope.schema}`,
  )

  return lines.join('\n')
}
