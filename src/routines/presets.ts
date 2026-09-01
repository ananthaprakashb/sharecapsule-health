export type RoutinePreset = {
  id: string
  title: string
  subtitle: string
  icon: string
  activityIds: string[]
}

export const routinePresets: RoutinePreset[] = [
  {
    id: 'morning-reset',
    title: 'Morning Reset',
    subtitle: 'Meditation followed by gentle movement',
    icon: '🌤️',
    activityIds: ['meditation-reset', 'gentle-stretch'],
  },
  {
    id: 'workday-reset',
    title: 'Workday Reset',
    subtitle: 'Step away from the screen and move',
    icon: '💻',
    activityIds: ['eye-rest', 'mindful-walk'],
  },
  {
    id: 'evening-unwind',
    title: 'Evening Unwind',
    subtitle: 'Slow down with movement and quiet time',
    icon: '🌙',
    activityIds: ['gentle-stretch', 'meditation-reset'],
  },
]
