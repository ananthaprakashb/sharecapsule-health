import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles.css'
import './phase2.css'
import './phase3.css'
import './phase4.css'
import './phase5.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      const announceUpdate = () => window.dispatchEvent(new Event('sharecapsule:update-ready'))
      if (registration.waiting) announceUpdate()
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) announceUpdate()
        })
      })
    }).catch(() => undefined)
  })
}
