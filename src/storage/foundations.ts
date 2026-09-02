import { readCheckins } from './checkins'
import { readGratitudeMoments } from './gratitude'
import { readCompletions } from './progress'

export type SleepQuality = 'poor' | 'okay' | 'good' | 'restorative'
export type LearningReflection = {
  id: string
  createdAt: string
  kind: 'reading' | 'recall'
  topic?: string
  keyIdea?: string
}
export type SleepEntry = {
  id: string
  createdAt: string
  phase: 'morning' | 'evening'
  quality?: SleepQuality
  hours?: number
}
export type FoundationId = 'breathe' | 'move' | 'learn' | 'restore' | 'connect' | 'reflect'
export type FoundationStatus = { id: FoundationId; label: string; icon: string; active: boolean; detail: string }

const LEARNING_KEY = 'sharecapsule-health:learning-reflections'
const SLEEP_KEY = 'sharecapsule-health:sleep-checkins'

function readArray<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function readLearningReflections() { return readArray<LearningReflection>(LEARNING_KEY).slice(0, 300) }
export function saveLearningReflection(entry: LearningReflection) {
  const next = [entry, ...readLearningReflections()].slice(0, 300)
  localStorage.setItem(LEARNING_KEY, JSON.stringify(next))
  return next
}
export function readSleepEntries() { return readArray<SleepEntry>(SLEEP_KEY).slice(0, 300) }
export function saveSleepEntry(entry: SleepEntry) {
  const next = [entry, ...readSleepEntries()].slice(0, 300)
  localStorage.setItem(SLEEP_KEY, JSON.stringify(next))
  return next
}

function sameLocalDay(value: string, date = new Date()) {
  return new Date(value).toDateString() === date.toDateString()
}

const BREATHE_IDS = new Set(['thirumoolar-breath'])
const MOVE_IDS = new Set(['gentle-stretch', 'mindful-walk'])
const LEARN_IDS = new Set(['intentional-reading', 'active-recall'])
const RESTORE_IDS = new Set(['restore-sleep'])
const REFLECT_IDS = new Set(['meditation-reset'])

export function getDailyFoundationSummary(date = new Date()): FoundationStatus[] {
  const completions = readCompletions().filter((item) => sameLocalDay(item.completedAt, date))
  const ids = new Set(completions.map((item) => item.activityId))
  const readingSeconds = completions.filter((item) => item.activityId === 'intentional-reading').reduce((sum, item) => sum + item.durationSeconds, 0)
  const recallDone = ids.has('active-recall')
  const gratitudeDone = readGratitudeMoments().some((item) => sameLocalDay(item.createdAt, date))
  const checkinDone = readCheckins().some((item) => sameLocalDay(item.createdAt, date))
  const sleepEntry = readSleepEntries().find((item) => sameLocalDay(item.createdAt, date))
  const readingMinutes = Math.round(readingSeconds / 60)

  return [
    { id: 'breathe', label: 'Breathe', icon: '🫁', active: [...BREATHE_IDS].some((id) => ids.has(id)), detail: 'Breath practice' },
    { id: 'move', label: 'Move', icon: '🚶', active: [...MOVE_IDS].some((id) => ids.has(id)), detail: 'Walk or stretch' },
    { id: 'learn', label: 'Learn', icon: '🧠', active: [...LEARN_IDS].some((id) => ids.has(id)), detail: readingMinutes ? `${readingMinutes} min reading${recallDone ? ' · recall ✓' : ''}` : recallDone ? 'Active recall ✓' : 'Read or recall' },
    { id: 'restore', label: 'Restore', icon: '🌙', active: [...RESTORE_IDS].some((id) => ids.has(id)) || Boolean(sleepEntry), detail: sleepEntry?.quality ? `${sleepEntry.quality} sleep` : sleepEntry ? 'Sleep check-in ✓' : 'Sleep & wind-down' },
    { id: 'connect', label: 'Connect', icon: '💛', active: gratitudeDone, detail: 'Gratitude & people' },
    { id: 'reflect', label: 'Reflect', icon: '💭', active: checkinDone || [...REFLECT_IDS].some((id) => ids.has(id)), detail: checkinDone ? 'Check-in ✓' : 'Check in or meditate' },
  ]
}

export function getWeeklyFoundationSummary() {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - index)
    return getDailyFoundationSummary(date)
  })
  const template = getDailyFoundationSummary()
  return template.map((item) => ({ ...item, days: days.filter((day) => day.find((entry) => entry.id === item.id)?.active).length }))
}
