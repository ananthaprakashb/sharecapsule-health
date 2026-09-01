import type { HealthActivity } from '../types/activity'
import { thirumoolarBreath } from './thirumoolar'

export const meditationActivity: HealthActivity = {
  id: 'meditation-reset',
  slug: 'meditation',
  title: 'Quiet Meditation',
  subtitle: 'A simple five-minute reset',
  category: 'mind',
  durationMinutes: 5,
  icon: '🧘',
  description: 'A quiet timer with a few gentle prompts to help you settle, stay present and close the practice.',
  safetyNote: 'Choose a comfortable position. Stop or change position if you feel uncomfortable.',
  steps: [
    { id: 'arrive', label: 'Arrive', seconds: 60, instruction: 'Settle into a comfortable position and notice your natural breathing.' },
    { id: 'stay', label: 'Stay', seconds: 180, instruction: 'Let thoughts come and go. Gently return attention to the present moment.' },
    { id: 'close', label: 'Close', seconds: 60, instruction: 'Notice your surroundings again and finish when you feel ready.' },
  ],
}

export const stretchActivity: HealthActivity = {
  id: 'gentle-stretch',
  slug: 'stretch',
  title: 'Gentle Stretch',
  subtitle: 'Three-minute mobility break',
  category: 'movement',
  durationMinutes: 3,
  icon: '🤸',
  description: 'A short sequence of comfortable movements for a break between periods of sitting or focused work.',
  safetyNote: 'Move only within a comfortable range. Avoid forcing a stretch or moving through pain.',
  steps: [
    { id: 'shoulders', label: 'Shoulders', seconds: 45, instruction: 'Roll the shoulders slowly and let the arms stay relaxed.' },
    { id: 'neck', label: 'Neck', seconds: 45, instruction: 'Turn the head gently from side to side without forcing the range.' },
    { id: 'reach', label: 'Reach', seconds: 45, instruction: 'Reach the arms upward comfortably, then lower them slowly.' },
    { id: 'stand', label: 'Stand tall', seconds: 45, instruction: 'Stand or sit tall, relax the shoulders and take a few easy breaths.' },
  ],
}

export const walkActivity: HealthActivity = {
  id: 'mindful-walk',
  slug: 'walk',
  title: 'Mindful Walk',
  subtitle: 'Five-minute walking timer',
  category: 'movement',
  durationMinutes: 5,
  icon: '🚶',
  description: 'A lightweight walking timer that keeps the screen simple while you move at a comfortable pace.',
  safetyNote: 'Walk somewhere safe and pay attention to your surroundings. Stop if you feel unwell or unsteady.',
  steps: [
    { id: 'start', label: 'Settle in', seconds: 60, instruction: 'Begin at an easy pace and notice the rhythm of your steps.' },
    { id: 'walk', label: 'Keep moving', seconds: 180, instruction: 'Continue at a comfortable pace while staying aware of your surroundings.' },
    { id: 'finish', label: 'Ease down', seconds: 60, instruction: 'Slow the pace slightly and finish the walk comfortably.' },
  ],
}

export const eyeRestActivity: HealthActivity = {
  id: 'eye-rest',
  slug: 'eye-rest',
  title: 'Eye Rest',
  subtitle: 'One-minute screen break',
  category: 'wellness',
  durationMinutes: 1,
  icon: '👁️',
  description: 'A short pause from the screen with simple distance-looking and blinking prompts.',
  safetyNote: 'This is a comfort break, not treatment for an eye condition. Seek professional care for persistent eye symptoms.',
  steps: [
    { id: 'look-away', label: 'Look away', seconds: 20, instruction: 'Look at a comfortable distant object instead of the screen.' },
    { id: 'blink', label: 'Blink naturally', seconds: 20, instruction: 'Keep looking away and blink naturally without squeezing the eyes.' },
    { id: 'return', label: 'Return gently', seconds: 20, instruction: 'Relax your gaze, then return to the screen when the timer ends.' },
  ],
}

export const coreActivities: HealthActivity[] = [
  thirumoolarBreath,
  meditationActivity,
  stretchActivity,
  walkActivity,
  eyeRestActivity,
]

export const timedActivities: HealthActivity[] = [
  meditationActivity,
  stretchActivity,
  walkActivity,
  eyeRestActivity,
]

export function getActivityBySlug(slug: string) {
  return coreActivities.find((activity) => activity.slug === slug)
}

export function getActivityById(id: string) {
  return coreActivities.find((activity) => activity.id === id)
}
