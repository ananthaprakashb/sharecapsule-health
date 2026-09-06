import { useEffect, useState } from 'react'
import { APP_NAME } from '../brand'
import { isNativeApp } from '../platform/runtime'

export function PwaUpdateNotice() {
  const native = isNativeApp()
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    if (native || !('serviceWorker' in navigator)) return

    const show = () => setAvailable(true)
    window.addEventListener('sharecapsule:update-ready', show)
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) setAvailable(true)
    }).catch(() => undefined)

    return () => window.removeEventListener('sharecapsule:update-ready', show)
  }, [native])

  async function updateApp() {
    if (native || !('serviceWorker' in navigator)) return
    const registration = await navigator.serviceWorker.getRegistration()
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  if (native || !available) return null

  return (
    <div className="pwa-update-notice" role="status">
      <span>A new {APP_NAME} version is ready.</span>
      <button type="button" onClick={updateApp}>Update</button>
    </div>
  )
}
