const SETTINGS_KEY = 'sharecapsule-health:settings'

export type HealthSettings = {
  guidanceChimes: boolean
  completionChime: boolean
  vibrationCues: boolean
  keepScreenAwake: boolean
}

export const DEFAULT_SETTINGS: HealthSettings = {
  guidanceChimes: true,
  completionChime: true,
  vibrationCues: true,
  keepScreenAwake: true,
}

export function readSettings(): HealthSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<HealthSettings>
    return {
      guidanceChimes: typeof parsed.guidanceChimes === 'boolean' ? parsed.guidanceChimes : DEFAULT_SETTINGS.guidanceChimes,
      completionChime: typeof parsed.completionChime === 'boolean' ? parsed.completionChime : DEFAULT_SETTINGS.completionChime,
      vibrationCues: typeof parsed.vibrationCues === 'boolean' ? parsed.vibrationCues : DEFAULT_SETTINGS.vibrationCues,
      keepScreenAwake: typeof parsed.keepScreenAwake === 'boolean' ? parsed.keepScreenAwake : DEFAULT_SETTINGS.keepScreenAwake,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: HealthSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  return settings
}
