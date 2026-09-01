import { useEffect, useState } from 'react'

export function PwaUpdateNotice() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const show = () => setAvailable(true)
    window.addEventListener('sharecapsule:update-ready', show)
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) setAvailable(true)
    }).catch(() => undefined)

    return () => window.removeEventListener('sharecapsule:update-ready', show)
  }, [])

  async function updateApp() {
    if (!('serviceWorker' in navigator)) return
    const registration = await navigator.serviceWorker.getRegistration()
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!available) return null

  return (
    <div className="pwa-update-notice" role="status">
      <span>A new ShareCapsule Health version is ready.</span>
      <button type="button" onClick={updateApp}>Update</button>
    </div>
  )
}
