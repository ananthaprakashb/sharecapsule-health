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
    id: 'learning-reset',
    title: 'Learning Reset',
    subtitle: 'Read intentionally, then retrieve it from memory',
    icon: '🧠',
    activityIds: ['intentional-reading', 'active-recall'],
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
    title: 'Evening Restore',
    subtitle: 'Gentle movement followed by a wind-down or sleep check-in',
    icon: '🌙',
    activityIds: ['gentle-stretch', 'restore-sleep'],
  },
]
