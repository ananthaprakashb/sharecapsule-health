import { getActivityById } from '../activities/library'
import { getProgressSummary } from '../storage/progress'

type ProgressPageProps = {
  onBack: () => void
}

export function ProgressPage({ onBack }: ProgressPageProps) {
  const summary = getProgressSummary()
  const maxMinutes = Math.max(1, ...summary.week.map((day) => day.minutes))

  return (
    <main className="page-shell">
      <header className="subpage-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back to Health">←</button>
        <div>
          <p className="eyebrow">Local progress</p>
          <h1>Progress</h1>
        </div>
      </header>

      <section className="progress-summary">
        <div><strong>{summary.totalActivities}</strong><span>activities</span></div>
        <div><strong>{summary.totalMinutes}</strong><span>minutes</span></div>
        <div><strong>{summary.streak}</strong><span>day streak</span></div>
      </section>

      <section className="section-block progress-card">
        <p className="eyebrow">Last 7 days</p>
        <h2>Your activity</h2>
        <div className="week-chart" aria-label="Minutes practiced over the last seven days">
          {summary.week.map((day) => (
            <div className="week-day" key={day.key}>
              <div className="week-bar-track">
                <span style={{ height: `${Math.max(day.minutes ? 12 : 2, (day.minutes / maxMinutes) * 100)}%` }} />
              </div>
              <strong>{day.minutes}</strong>
              <small>{day.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block progress-card">
        <p className="eyebrow">History</p>
        <h2>Recent activities</h2>
        {summary.recent.length ? (
          <div className="recent-list">
            {summary.recent.map((item, index) => {
              const activity = getActivityById(item.activityId)
              const completed = new Date(item.completedAt)
              return (
                <div key={`${item.completedAt}-${index}`}>
                  <span aria-hidden="true">{activity?.icon ?? '✓'}</span>
                  <div>
                    <strong>{activity?.title ?? 'Wellness activity'}</strong>
                    <small>{completed.toLocaleDateString()} · {completed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
                  </div>
                  <b>{Math.max(1, Math.round(item.durationSeconds / 60))}m</b>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-copy">Complete an activity and it will appear here.</p>
        )}
      </section>

      <p className="privacy-note">Progress is stored locally in this browser. No ShareCapsule account is required.</p>
    </main>
  )
}
