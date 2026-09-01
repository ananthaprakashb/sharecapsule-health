import { useEffect, useState } from 'react'

export function ConnectivityBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (online) return null

  return (
    <div className="connectivity-banner" role="status">
      Offline — saved activities and timers still work on this device.
    </div>
  )
}
