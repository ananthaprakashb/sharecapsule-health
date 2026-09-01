import type { HealthActivity } from '../types/activity'

type ActivityCardProps = {
  activity: HealthActivity
  onOpen: () => void
}

export function ActivityCard({ activity, onOpen }: ActivityCardProps) {
  return (
    <button className="activity-card" onClick={onOpen} type="button">
      <span className="activity-icon" aria-hidden="true">{activity.icon}</span>
      <span className="activity-copy">
        <strong>{activity.title}</strong>
        <span>{activity.subtitle}</span>
      </span>
      <span className="activity-duration">{activity.durationMinutes} min</span>
    </button>
  )
}
