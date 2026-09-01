import { useEffect, useState } from 'react'
import { getActivityById, getActivityBySlug } from './activities/library'
import { HomePage } from './pages/HomePage'
import { ProgressPage } from './pages/ProgressPage'
import { RoutinesPage } from './pages/RoutinesPage'
import { ThirumoolarBreathPage } from './pages/ThirumoolarBreathPage'
import { TimedActivityPage } from './pages/TimedActivityPage'
import type { HealthActivity } from './types/activity'

type Route =
  | { page: 'home' }
  | { page: 'routines' }
  | { page: 'progress' }
  | { page: 'activity'; slug: string }

type ActiveRoutine = {
  title: string
  activityIds: string[]
  index: number
}

function routeFromHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash === 'routines') return { page: 'routines' }
  if (hash === 'progress') return { page: 'progress' }
  if (hash.startsWith('activity/')) return { page: 'activity', slug: hash.slice('activity/'.length) }
  if (hash === 'breathe/thirumoolar') return { page: 'activity', slug: 'thirumoolar' }
  return { page: 'home' }
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(null)

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(next: Route) {
    if (next.page === 'home') window.location.hash = '/'
    if (next.page === 'routines') window.location.hash = '/routines'
    if (next.page === 'progress') window.location.hash = '/progress'
    if (next.page === 'activity') window.location.hash = `/activity/${next.slug}`
    setRoute(next)
  }

  function openActivity(activity: HealthActivity) {
    setActiveRoutine(null)
    navigate({ page: 'activity', slug: activity.slug })
  }

  function startRoutine(title: string, activityIds: string[]) {
    if (!activityIds.length) return
    const first = getActivityById(activityIds[0])
    if (!first) return

    setActiveRoutine({ title, activityIds, index: 0 })
    navigate({ page: 'activity', slug: first.slug })
  }

  function finishTimedActivity() {
    if (!activeRoutine) {
      navigate({ page: 'home' })
      return
    }

    const nextIndex = activeRoutine.index + 1
    const nextId = activeRoutine.activityIds[nextIndex]
    const nextActivity = nextId ? getActivityById(nextId) : undefined

    if (!nextActivity) {
      setActiveRoutine(null)
      navigate({ page: 'routines' })
      return
    }

    setActiveRoutine({ ...activeRoutine, index: nextIndex })
    navigate({ page: 'activity', slug: nextActivity.slug })
  }

  function cancelActivity() {
    const wasRoutine = Boolean(activeRoutine)
    setActiveRoutine(null)
    navigate({ page: wasRoutine ? 'routines' : 'home' })
  }

  if (route.page === 'routines') {
    return <RoutinesPage onBack={() => navigate({ page: 'home' })} onStartRoutine={startRoutine} />
  }

  if (route.page === 'progress') {
    return <ProgressPage onBack={() => navigate({ page: 'home' })} />
  }

  if (route.page === 'activity') {
    const activity = getActivityBySlug(route.slug)
    if (!activity) {
      return <HomePage onOpenActivity={openActivity} onOpenRoutines={() => navigate({ page: 'routines' })} onOpenProgress={() => navigate({ page: 'progress' })} />
    }

    if (activity.slug === 'thirumoolar') {
      return <ThirumoolarBreathPage onBack={() => navigate({ page: 'home' })} />
    }

    const nextId = activeRoutine?.activityIds[(activeRoutine?.index ?? 0) + 1]
    const nextActivity = nextId ? getActivityById(nextId) : undefined

    return (
      <TimedActivityPage
        activity={activity}
        onBack={cancelActivity}
        onDone={finishTimedActivity}
        routineLabel={activeRoutine?.title}
        nextLabel={activeRoutine ? (nextActivity ? `Next: ${nextActivity.title}` : 'Finish routine') : undefined}
      />
    )
  }

  return (
    <HomePage
      onOpenActivity={openActivity}
      onOpenRoutines={() => navigate({ page: 'routines' })}
      onOpenProgress={() => navigate({ page: 'progress' })}
    />
  )
}
