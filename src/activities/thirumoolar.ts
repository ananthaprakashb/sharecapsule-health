import type { HealthActivity } from '../types/activity'

export const thirumoolarBreath: HealthActivity = {
  id: 'thirumoolar-breath',
  slug: 'thirumoolar',
  title: 'Thirumoolar Breath',
  subtitle: 'Traditional 1 : 4 : 2 breathing practice',
  category: 'breathing',
  durationMinutes: 5,
  icon: '🫁',
  description: 'A guided Purakam, Kumbakam and Rechakam breathing cycle inspired by the traditional 1:4:2 ratio.',
  safetyNote: 'Practice comfortably and never strain or force breath retention. Stop if you feel dizzy or uncomfortable. This wellness activity is not medical treatment.',
  steps: [
    { id: 'inhale', label: 'Inhale', tamilLabel: 'Purakam', seconds: 4, instruction: 'Breathe in gently through the nose.' },
    { id: 'hold', label: 'Hold', tamilLabel: 'Kumbakam', seconds: 16, instruction: 'Hold only as long as it feels comfortable.' },
    { id: 'exhale', label: 'Exhale', tamilLabel: 'Rechakam', seconds: 8, instruction: 'Release the breath slowly and steadily.' },
  ],
}
