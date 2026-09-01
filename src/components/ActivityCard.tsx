import type { HealthActivity } from '../types/activity'

type ActivityCardProps = {
  activity: HealthActivity
  onOpen: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function ActivityCard({
  activity,
  onOpen,
  isFavorite = false,
  onToggleFavorite,
}: ActivityCardProps) {
  return (
    <div className="activity-row">
      <button className="activity-card" onClick={onOpen} type="button">
        <span className="activity-icon" aria-hidden="true">{activity.icon}</span>
        <span className="activity-copy">
          <strong>{activity.title}</strong>
          <span>{activity.subtitle}</span>
        </span>
        <span className="activity-duration">{activity.durationMinutes} min</span>
      </button>
      {onToggleFavorite ? (
        <button
          className={isFavorite ? 'favorite-button active' : 'favorite-button'}
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `Remove ${activity.title} from favorites` : `Add ${activity.title} to favorites`}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      ) : null}
    </div>
  )
}
