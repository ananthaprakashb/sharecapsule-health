import { useState } from 'react'
import { coreActivities } from '../activities/library'
import { ActivityCard } from '../components/ActivityCard'
import { readFavorites, toggleFavorite } from '../storage/preferences'
import { getTodaySummary } from '../storage/progress'
import type { HealthActivity } from '../types/activity'

type HomePageProps = {
  onOpenActivity: (activity: HealthActivity) => void
  onOpenRoutines: () => void
  onOpenProgress: () => void
}

export function HomePage({ onOpenActivity, onOpenRoutines, onOpenProgress }: HomePageProps) {
  const summary = getTodaySummary()
  const [favorites, setFavorites] = useState(readFavorites)
  const favoriteActivities = coreActivities.filter((activity) => favorites.includes(activity.id))

  function changeFavorite(activityId: string) {
    setFavorites(toggleFavorite(activityId))
  }

  function renderActivity(activity: HealthActivity) {
    return (
      <ActivityCard
        key={activity.id}
        activity={activity}
        onOpen={() => onOpenActivity(activity)}
        isFavorite={favorites.includes(activity.id)}
        onToggleFavorite={() => changeFavorite(activity.id)}
      />
    )
  }

  return (
    <main className="page-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">ShareCapsule</p>
          <h1>Health</h1>
        </div>
        <span className="brand-mark" aria-hidden="true">♥</span>
      </header>

      <section className="hero-card">
        <p className="eyebrow">Today</p>
        <h2>Take a few minutes for yourself.</h2>
        <p>Small, guided wellness activities that fit naturally into your day.</p>
        <div className="today-stats" aria-label="Today's progress">
          <div><strong>{summary.activities}</strong><span>activities</span></div>
          <div><strong>{summary.minutes}</strong><span>minutes</span></div>
          <div><strong>Local</strong><span>private progress</span></div>
        </div>
        <div className="hero-actions">
          <button type="button" onClick={onOpenRoutines}>Start a routine</button>
          <button type="button" onClick={onOpenProgress}>View progress</button>
        </div>
      </section>

      {favoriteActivities.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Favorites</p>
              <h2>Your quick starts</h2>
            </div>
          </div>
          <div className="activity-list">{favoriteActivities.map(renderActivity)}</div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Activity library</p>
            <h2>Choose what you need</h2>
          </div>
          <span className="library-count">{coreActivities.length} activities</span>
        </div>
        <div className="activity-list">{coreActivities.map(renderActivity)}</div>
      </section>

      <nav className="home-nav" aria-label="Health app navigation">
        <button type="button" aria-current="page"><span>⌂</span>Today</button>
        <button type="button" onClick={onOpenRoutines}><span>☷</span>Routines</button>
        <button type="button" onClick={onOpenProgress}><span>◔</span>Progress</button>
      </nav>

      <footer className="app-footer">Wellness guidance, not medical treatment.</footer>
    </main>
  )
}
