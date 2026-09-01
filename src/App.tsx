import { useEffect, useState } from 'react'
import { getActivityById, getActivityBySlug } from './activities/library'
import { AppChrome } from './components/AppChrome'
import type { AppSection } from './components/AppChrome'
import { AiSharingPage } from './pages/AiSharingPage'
import { HomePage } from './pages/HomePage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProgressPage } from './pages/ProgressPage'
import { RoutinesPage } from './pages/RoutinesPage'
import { SettingsPage } from './pages/SettingsPage'
import { ThirumoolarBreathPage } from './pages/ThirumoolarBreathPage'
import { TimedActivityPage } from './pages/TimedActivityPage'
import { VoiceCheckinPage } from './pages/VoiceCheckinPage'
import type { HealthActivity } from './types/activity'

type StaticPage = AppSection | 'privacy' | 'ai-sharing' | 'check-in'
type Route = { page: StaticPage } | { page: 'activity'; slug: string }
type ActiveRoutine = { title: string; activityIds: string[]; index: number }

function routeFromHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash === 'routines') return { page: 'routines' }
  if (hash === 'progress') return { page: 'progress' }
  if (hash === 'settings') return { page: 'settings' }
  if (hash === 'privacy') return { page: 'privacy' }
  if (hash === 'ai-sharing') return { page: 'ai-sharing' }
  if (hash === 'check-in') return { page: 'check-in' }
  if (hash.startsWith('activity/')) return { page: 'activity', slug: hash.slice('activity/'.length) }
  if (hash === 'breathe/thirumoolar') return { page: 'activity', slug: 'thirumoolar' }
  return { page: 'home' }
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(null)

  useEffect(() => { const onHashChange = () => setRoute(routeFromHash()); window.addEventListener('hashchange', onHashChange); return () => window.removeEventListener('hashchange', onHashChange) }, [])
  useEffect(() => {
    const pageTitle = route.page === 'activity' ? getActivityBySlug(route.slug)?.title ?? 'Health activity' : route.page === 'home' ? 'ShareCapsule Health' : route.page === 'ai-sharing' ? 'Share with AI · ShareCapsule Health' : route.page === 'check-in' ? 'Voice check-in · ShareCapsule Health' : `${route.page.charAt(0).toUpperCase()}${route.page.slice(1)} · ShareCapsule Health`
    document.title = pageTitle
  }, [route])

  function navigate(next: Route) {
    if (next.page === 'home') window.location.hash = '/'
    if (next.page === 'routines') window.location.hash = '/routines'
    if (next.page === 'progress') window.location.hash = '/progress'
    if (next.page === 'settings') window.location.hash = '/settings'
    if (next.page === 'privacy') window.location.hash = '/privacy'
    if (next.page === 'ai-sharing') window.location.hash = '/ai-sharing'
    if (next.page === 'check-in') window.location.hash = '/check-in'
    if (next.page === 'activity') window.location.hash = `/activity/${next.slug}`
    setRoute(next)
  }

  function navigateSection(page: AppSection) { navigate({ page }) }
  function openActivity(activity: HealthActivity) { setActiveRoutine(null); navigate({ page: 'activity', slug: activity.slug }) }
  function startRoutine(title: string, activityIds: string[]) { if (!activityIds.length) return; const first = getActivityById(activityIds[0]); if (!first) return; setActiveRoutine({ title, activityIds, index: 0 }); navigate({ page: 'activity', slug: first.slug }) }
  function finishTimedActivity() { if (!activeRoutine) { navigate({ page: 'home' }); return }; const nextIndex = activeRoutine.index + 1; const nextId = activeRoutine.activityIds[nextIndex]; const nextActivity = nextId ? getActivityById(nextId) : undefined; if (!nextActivity) { setActiveRoutine(null); navigate({ page: 'routines' }); return }; setActiveRoutine({ ...activeRoutine, index: nextIndex }); navigate({ page: 'activity', slug: nextActivity.slug }) }
  function cancelActivity() { const wasRoutine = Boolean(activeRoutine); setActiveRoutine(null); navigate({ page: wasRoutine ? 'routines' : 'home' }) }

  if (route.page === 'routines') return <AppChrome active="routines" onNavigate={navigateSection}><RoutinesPage onBack={() => navigate({ page: 'home' })} onStartRoutine={startRoutine} /></AppChrome>
  if (route.page === 'progress') return <AppChrome active="progress" onNavigate={navigateSection}><ProgressPage onBack={() => navigate({ page: 'home' })} onShareProgress={() => navigate({ page: 'ai-sharing' })} onOpenCheckin={() => navigate({ page: 'check-in' })} /></AppChrome>
  if (route.page === 'settings') return <AppChrome active="settings" onNavigate={navigateSection}><SettingsPage onBack={() => navigate({ page: 'home' })} onOpenPrivacy={() => navigate({ page: 'privacy' })} onOpenAiSharing={() => navigate({ page: 'ai-sharing' })} /></AppChrome>
  if (route.page === 'privacy') return <AppChrome active="settings" onNavigate={navigateSection}><PrivacyPage onBack={() => navigate({ page: 'settings' })} /></AppChrome>
  if (route.page === 'ai-sharing') return <AppChrome active="progress" onNavigate={navigateSection}><AiSharingPage onBack={() => navigate({ page: 'progress' })} /></AppChrome>
  if (route.page === 'check-in') return <AppChrome active="progress" onNavigate={navigateSection}><VoiceCheckinPage onBack={() => navigate({ page: 'home' })} /></AppChrome>

  if (route.page === 'activity') {
    const activity = getActivityBySlug(route.slug)
    if (!activity) return <AppChrome active="home" onNavigate={navigateSection}><HomePage onOpenActivity={openActivity} onOpenRoutines={() => navigate({ page: 'routines' })} onOpenProgress={() => navigate({ page: 'progress' })} onOpenCheckin={() => navigate({ page: 'check-in' })} /></AppChrome>
    if (activity.slug === 'thirumoolar') return <ThirumoolarBreathPage onBack={() => navigate({ page: 'home' })} />
    const nextId = activeRoutine?.activityIds[(activeRoutine?.index ?? 0) + 1]
    const nextActivity = nextId ? getActivityById(nextId) : undefined
    return <TimedActivityPage key={activity.id} activity={activity} onBack={cancelActivity} onDone={finishTimedActivity} routineLabel={activeRoutine?.title} nextLabel={activeRoutine ? (nextActivity ? `Next: ${nextActivity.title}` : 'Finish routine') : undefined} />
  }

  return <AppChrome active="home" onNavigate={navigateSection}><HomePage onOpenActivity={openActivity} onOpenRoutines={() => navigate({ page: 'routines' })} onOpenProgress={() => navigate({ page: 'progress' })} onOpenCheckin={() => navigate({ page: 'check-in' })} /></AppChrome>
}
