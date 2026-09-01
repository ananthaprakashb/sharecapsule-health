export type HealthCategory = 'breathing' | 'mind' | 'movement' | 'sleep' | 'wellness'

export type ActivityStep = {
  id: string
  label: string
  tamilLabel?: string
  seconds: number
  instruction: string
}

export type HealthActivity = {
  id: string
  slug: string
  title: string
  subtitle: string
  category: HealthCategory
  durationMinutes: number
  icon: string
  description: string
  steps: ActivityStep[]
  safetyNote?: string
}

export type ActivityCompletion = {
  activityId: string
  completedAt: string
  durationSeconds: number
  cycles?: number
}
