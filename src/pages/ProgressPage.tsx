import { getActivityById } from '../activities/library'
import { getBadges } from '../engagement/badges'
import { readGoals } from '../storage/engagement'
import { getProgressSummary, getTodaySummary } from '../storage/progress'

type ProgressPageProps = { onBack: () => void }

export function ProgressPage({ onBack }: ProgressPageProps) {
  const summary = getProgressSummary()
  const today = getTodaySummary()
  const goals = readGoals()
  const badges = getBadges(summary)
  const maxMinutes = Math.max(1, ...summary.week.map((day) => day.minutes))
  const unlocked = badges.filter((badge) => badge.unlocked).length

  return (
    <main className="page-shell">
      <header className="subpage-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back to Health">←</button>
        <div><p className="eyebrow">Local progress</p><h1>Progress</h1></div>
      </header>

      <section className="progress-summary">
        <div><strong>{summary.totalActivities}</strong><span>activities</span></div>
        <div><strong>{summary.totalMinutes}</strong><span>minutes</span></div>
        <div><strong>{summary.streak}</strong><span>current streak</span></div>
      </section>

      <section className="phase4-progress-insights">
        <div><span>🔥</span><strong>{summary.bestStreak} days</strong><small>best streak</small></div>
        <div><span>🎯</span><strong>{summary.goalDays} days</strong><small>both goals met</small></div>
        <div><span>🏅</span><strong>{unlocked} / {badges.length}</strong><small>badges unlocked</small></div>
      </section>

      <section className="section-block progress-card phase4-today-goal">
        <p className="eyebrow">Today</p>
        <h2>Goal progress</h2>
        <p>{today.minutes} / {goals.minutes} minutes · {today.activities} / {goals.activities} activities</p>
        <div className="phase4-goal-meter"><span style={{ width: `${Math.min(100, Math.round((today.minutes / goals.minutes) * 100))}%` }} /></div>
      </section>

      <section className="section-block progress-card">
        <p className="eyebrow">Last 7 days</p>
        <h2>Your activity</h2>
        <div className="week-chart" aria-label="Minutes practiced over the last seven days">
          {summary.week.map((day) => (
            <div className="week-day" key={day.key}>
              <div className="week-bar-track"><span style={{ height: `${Math.max(day.minutes ? 12 : 2, (day.minutes / maxMinutes) * 100)}%` }} /></div>
              <strong>{day.minutes}</strong><small>{day.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block progress-card">
        <p className="eyebrow">Achievements</p>
        <h2>Badges</h2>
        <div className="phase4-badge-grid">
          {badges.map((badge) => (
            <article className={badge.unlocked ? 'unlocked' : 'locked'} key={badge.id}>
              <span aria-hidden="true">{badge.unlocked ? badge.icon : '○'}</span>
              <div><strong>{badge.title}</strong><small>{badge.description}</small></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block progress-card">
        <p className="eyebrow">History</p><h2>Recent activities</h2>
        {summary.recent.length ? (
          <div className="recent-list">
            {summary.recent.map((item, index) => {
              const activity = getActivityById(item.activityId)
              const completed = new Date(item.completedAt)
              return (
                <div key={`${item.completedAt}-${index}`}>
                  <span aria-hidden="true">{activity?.icon ?? '✓'}</span>
                  <div><strong>{activity?.title ?? 'Wellness activity'}</strong><small>{completed.toLocaleDateString()} · {completed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div>
                  <b>{Math.max(1, Math.round(item.durationSeconds / 60))}m</b>
                </div>
              )
            })}
          </div>
        ) : <p className="empty-copy">Complete an activity and it will appear here.</p>}
      </section>

      <p className="privacy-note">Progress and achievements are stored locally in this browser. No ShareCapsule account is required.</p>
    </main>
  )
}
