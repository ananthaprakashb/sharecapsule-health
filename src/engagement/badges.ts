export type BadgeProgress = {
  id: string
  icon: string
  title: string
  description: string
  unlocked: boolean
}

type BadgeSummary = {
  totalActivities: number
  totalMinutes: number
  streak: number
  bestStreak: number
  goalDays: number
}

export function getBadges(summary: BadgeSummary): BadgeProgress[] {
  return [
    {
      id: 'first-finish',
      icon: '🌱',
      title: 'First Finish',
      description: 'Complete your first wellness activity.',
      unlocked: summary.totalActivities >= 1,
    },
    {
      id: 'five-activities',
      icon: '✨',
      title: 'Getting Consistent',
      description: 'Complete 5 activities.',
      unlocked: summary.totalActivities >= 5,
    },
    {
      id: 'three-day-streak',
      icon: '🔥',
      title: 'Three-Day Rhythm',
      description: 'Build a 3-day activity streak.',
      unlocked: summary.bestStreak >= 3,
    },
    {
      id: 'seven-day-streak',
      icon: '🏅',
      title: 'Week Strong',
      description: 'Build a 7-day activity streak.',
      unlocked: summary.bestStreak >= 7,
    },
    {
      id: 'sixty-minutes',
      icon: '⏱️',
      title: 'One Hour Invested',
      description: 'Practice for 60 total minutes.',
      unlocked: summary.totalMinutes >= 60,
    },
    {
      id: 'goal-five',
      icon: '🎯',
      title: 'Goal Keeper',
      description: 'Reach both daily goals on 5 different days.',
      unlocked: summary.goalDays >= 5,
    },
  ]
}
