const FAVORITES_KEY = 'sharecapsule-health:favorites'
const CUSTOM_ROUTINE_KEY = 'sharecapsule-health:custom-routine'

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function readFavorites() {
  return readStringArray(FAVORITES_KEY)
}

export function toggleFavorite(activityId: string) {
  const current = readFavorites()
  const next = current.includes(activityId)
    ? current.filter((id) => id !== activityId)
    : [...current, activityId]

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  return next
}

export function readCustomRoutine() {
  return readStringArray(CUSTOM_ROUTINE_KEY)
}

export function saveCustomRoutine(activityIds: string[]) {
  localStorage.setItem(CUSTOM_ROUTINE_KEY, JSON.stringify(activityIds))
}
