export type GratitudeOutcome = 'shared' | 'private'
export type GratitudeMode = 'voice' | 'written'

export type GratitudeMoment = {
  id: string
  createdAt: string
  recipient?: string
  outcome: GratitudeOutcome
  mode: GratitudeMode
  recordingSeconds?: number
}

const STORAGE_KEY = 'sharecapsule-health:gratitude-moments'

export function readGratitudeMoments(): GratitudeMoment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GratitudeMoment[]) : []
  } catch {
    return []
  }
}

export function recordGratitudeMoment(moment: GratitudeMoment) {
  const moments = [moment, ...readGratitudeMoments()].slice(0, 300)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moments))
  return moments
}

export function getGratitudeSummary() {
  const moments = readGratitudeMoments()
  const now = new Date()
  const thisMonth = moments.filter((item) => {
    const date = new Date(item.createdAt)
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  })
  return {
    total: moments.length,
    thisMonth: thisMonth.length,
    shared: moments.filter((item) => item.outcome === 'shared').length,
    recent: moments.slice(0, 5),
  }
}
