import { useEffect, useState } from 'react'
import { APP_NAME } from '../brand'

function isActivityRoute() {
  const hash = window.location.hash
  return hash.startsWith('#/activity/') || hash === '#/check-in'
}

export function PwaUpdateNotice() {
  const [available, setAvailable] = useState(false)
  const [activityRoute, setActivityRoute] = useState(isActivityRoute)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const show = () => setAvailable(true)
    const onHashChange = () => setActivityRoute(isActivityRoute())
    window.addEventListener('sharecapsule:update-ready', show)
    window.addEventListener('hashchange', onHashChange)
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) setAvailable(true)
    }).catch(() => undefined)

    return () => {
      window.removeEventListener('sharecapsule:update-ready', show)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  async function updateApp() {
    if (!('serviceWorker' in navigator) || activityRoute) return
    const registration = await navigator.serviceWorker.getRegistration()
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!available) return null

  return (
    <div className="pwa-update-notice" role="status">
      <span>{activityRoute ? `A new ${APP_NAME} version is ready. Finish this activity, then update.` : `A new ${APP_NAME} version is ready.`}</span>
      {activityRoute ? <small>Your current activity will not be interrupted.</small> : <button type="button" onClick={updateApp}>Update</button>}
    </div>
  )
}
