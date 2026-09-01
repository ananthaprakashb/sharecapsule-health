import { useState } from 'react'
import { coreActivities, gratitudeActivity } from '../activities/library'
import { APP_SHORT_NAME, APP_TAGLINE } from '../brand'
import { ActivityCard } from '../components/ActivityCard'
import { PwaInstallCard } from '../components/PwaInstallCard'
import { readGoals } from '../storage/engagement'
import { getGratitudeSummary } from '../storage/gratitude'
import { readFavorites, toggleFavorite } from '../storage/preferences'
import { getProgressSummary, getTodaySummary } from '../storage/progress'
import type { HealthActivity } from '../types/activity'

type HomePageProps = { onOpenActivity: (activity: HealthActivity) => void; onOpenRoutines: () => void; onOpenProgress: () => void; onOpenCheckin: () => void }

export function HomePage({ onOpenActivity, onOpenRoutines, onOpenProgress, onOpenCheckin }: HomePageProps) {
  const summary = getTodaySummary(); const progress = getProgressSummary(); const goals = readGoals(); const gratitude = getGratitudeSummary(); const [favorites, setFavorites] = useState(readFavorites)
  const libraryActivities = coreActivities.filter((activity) => activity.id !== gratitudeActivity.id)
  const favoriteActivities = libraryActivities.filter((activity) => favorites.includes(activity.id))
  const minutesProgress = Math.min(100, Math.round((summary.minutes / goals.minutes) * 100)); const activitiesProgress = Math.min(100, Math.round((summary.activities / goals.activities) * 100)); const goalsMet = summary.minutes >= goals.minutes && summary.activities >= goals.activities
  function changeFavorite(activityId: string) { setFavorites(toggleFavorite(activityId)) }
  function renderActivity(activity: HealthActivity) { return <ActivityCard key={activity.id} activity={activity} onOpen={() => onOpenActivity(activity)} isFavorite={favorites.includes(activity.id)} onToggleFavorite={() => changeFavorite(activity.id)} /> }
  return <main className="page-shell phase3-home"><header className="app-header"><div><p className="eyebrow">by ShareCapsule</p><h1>{APP_SHORT_NAME}</h1><p>{APP_TAGLINE}</p></div><span className="brand-mark" aria-hidden="true">♥</span></header>
    <section className="hero-card"><p className="eyebrow">Today</p><h2>{goalsMet ? 'Daily goals complete.' : 'Take a few minutes for yourself.'}</h2><p>Small, guided wellness activities that fit naturally into your day.</p><div className="today-stats" aria-label="Today's progress"><div><strong>{summary.activities}</strong><span>activities</span></div><div><strong>{summary.minutes}</strong><span>minutes</span></div><div><strong>{progress.streak}</strong><span>day streak</span></div></div><div className="hero-actions"><button type="button" onClick={onOpenRoutines}>Start a routine</button><button type="button" onClick={onOpenProgress}>View progress</button></div></section>
    <section className="phase7-home-checkin"><div><span aria-hidden="true">🎙️</span><div><p className="eyebrow">How are you?</p><h2>Voice check-in</h2><p>Say how you feel, then confirm the label yourself.</p></div></div><button type="button" onClick={onOpenCheckin}>Check in</button></section>
    <section className="phase8-gratitude-card"><div className="phase8-gratitude-copy"><p className="eyebrow">Connection & gratitude</p><h2>Thank someone you do not see every day</h2><p>Remember one specific way they helped or influenced you, then send a short voice message in your own words.</p></div><div className="phase8-gratitude-side"><strong>{gratitude.thisMonth}</strong><small>gratitude moment{gratitude.thisMonth === 1 ? '' : 's'} this month</small><button className="primary-button" type="button" onClick={() => onOpenActivity(gratitudeActivity)}>Record a thank-you</button></div></section>
    <section className="phase4-goal-card" aria-label="Daily goals"><div className="phase4-goal-heading"><div><p className="eyebrow">Daily goals</p><h2>{goalsMet ? 'Nice work today' : 'Keep your rhythm'}</h2></div><span>{goalsMet ? '✓' : '🎯'}</span></div><div className="phase4-goal-row"><div><strong>{summary.minutes} / {goals.minutes} min</strong><span><i style={{ width: `${minutesProgress}%` }} /></span></div><div><strong>{summary.activities} / {goals.activities} activities</strong><span><i style={{ width: `${activitiesProgress}%` }} /></span></div></div></section>
    <div className="phase3-install-slot"><PwaInstallCard /></div>{favoriteActivities.length ? <section className="section-block"><div className="section-heading"><div><p className="eyebrow">Favorites</p><h2>Your quick starts</h2></div></div><div className="activity-list">{favoriteActivities.map(renderActivity)}</div></section> : null}
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">Activity library</p><h2>Choose what you need</h2></div><span className="library-count">{libraryActivities.length} activities</span></div><div className="activity-list">{libraryActivities.map(renderActivity)}</div></section><footer className="app-footer">Wellness guidance, not medical treatment.</footer></main>
}
