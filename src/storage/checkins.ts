export type CheckinMood = 'calm' | 'good' | 'energized' | 'okay' | 'tired' | 'stressed' | 'low' | 'frustrated' | 'other'

export type WellnessCheckin = {
  id: string
  createdAt: string
  mood: CheckinMood
  source: 'voice' | 'typed'
  note?: string
}

export const CHECKIN_MOODS: Array<{ id: CheckinMood; label: string; icon: string }> = [
  { id: 'calm', label: 'Calm', icon: '🌿' },
  { id: 'good', label: 'Good', icon: '🙂' },
  { id: 'energized', label: 'Energized', icon: '⚡' },
  { id: 'okay', label: 'Okay', icon: '😌' },
  { id: 'tired', label: 'Tired', icon: '😴' },
  { id: 'stressed', label: 'Stressed', icon: '🌪️' },
  { id: 'low', label: 'Low', icon: '🌧️' },
  { id: 'frustrated', label: 'Frustrated', icon: '😤' },
  { id: 'other', label: 'Other', icon: '💭' },
]

const STORAGE_KEY = 'sharecapsule-health:checkins'

export function getMoodLabel(mood: CheckinMood) {
  return CHECKIN_MOODS.find((item) => item.id === mood)?.label ?? 'Other'
}

export function readCheckins(): WellnessCheckin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WellnessCheckin[]
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.createdAt === 'string' && typeof item.mood === 'string').slice(0, 200) : []
  } catch {
    return []
  }
}

export function saveCheckin(checkin: WellnessCheckin) {
  const next = [checkin, ...readCheckins()].slice(0, 200)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

const ENGLISH_SELF_REPORTS: Array<{ mood: CheckinMood; words: string[] }> = [
  { mood: 'calm', words: ['calm', 'relaxed', 'peaceful'] },
  { mood: 'good', words: ['good', 'great', 'happy', 'positive'] },
  { mood: 'energized', words: ['energized', 'energetic', 'motivated', 'active'] },
  { mood: 'okay', words: ['okay', 'ok', 'fine', 'alright'] },
  { mood: 'tired', words: ['tired', 'exhausted', 'sleepy', 'drained'] },
  { mood: 'stressed', words: ['stressed', 'tense', 'overwhelmed'] },
  { mood: 'low', words: ['low', 'sad', 'down'] },
  { mood: 'frustrated', words: ['frustrated', 'angry', 'irritated', 'upset'] },
]

const TAMIL_SELF_REPORTS: Array<{ mood: CheckinMood; words: string[] }> = [
  { mood: 'calm', words: ['அமைதி', 'அமைதியாக'] },
  { mood: 'good', words: ['மகிழ்ச்சி', 'சந்தோஷம்'] },
  { mood: 'energized', words: ['உற்சாகம்', 'உற்சாகமாக'] },
  { mood: 'tired', words: ['சோர்வு', 'சோர்வாக'] },
  { mood: 'stressed', words: ['மன அழுத்தம்', 'பதற்றம்'] },
  { mood: 'low', words: ['சோகம்', 'வருத்தம்'] },
  { mood: 'frustrated', words: ['கோபம்', 'எரிச்சல்'] },
]

export function suggestMoodFromSelfReport(text: string): CheckinMood | null {
  const normalized = text.toLocaleLowerCase()
  const selfReportPrefix = /\b(?:i feel|i'm feeling|i am feeling|i'm|i am|feeling)\b/i
  if (selfReportPrefix.test(normalized)) {
    for (const item of ENGLISH_SELF_REPORTS) {
      if (item.words.some((word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i').test(normalized))) return item.mood
    }
  }
  for (const item of TAMIL_SELF_REPORTS) {
    if (item.words.some((word) => normalized.includes(word))) return item.mood
  }
  return null
}
