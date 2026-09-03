import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles.css'
import './phase2.css'
import './phase3.css'
import './phase4.css'
import './phase5.css'
import './phase6.css'
import './phase7.css'
import './phase8.css'
import './phase9.css'

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>)

const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    let refreshing = false
    let lastUpdateCheck = 0

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((registration) => {
      const announceUpdate = () => window.dispatchEvent(new Event('sharecapsule:update-ready'))
      const checkForUpdate = () => {
        const now = Date.now()
        if (now - lastUpdateCheck < 60_000) return
        lastUpdateCheck = now
        registration.update().catch(() => undefined)
      }

      if (registration.waiting) announceUpdate()
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) announceUpdate()
        })
      })

      checkForUpdate()
      window.addEventListener('focus', () => {
        if (Date.now() - lastUpdateCheck >= UPDATE_CHECK_INTERVAL_MS) checkForUpdate()
      })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - lastUpdateCheck >= UPDATE_CHECK_INTERVAL_MS) checkForUpdate()
      })
    }).catch(() => undefined)
  })
}
