import { useEffect, useState } from 'react'
import { APP_NAME, APP_SHORT_NAME } from '../brand'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type StandaloneNavigator = Navigator & {
  standalone?: boolean
}

function isStandalone() {
  const navigatorWithStandalone = navigator as StandaloneNavigator
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function PwaInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const ios = isIosDevice()

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  if (installed) {
    return (
      <aside className="pwa-install-card installed" aria-label="App installation status">
        <span aria-hidden="true">✓</span>
        <div>
          <strong>{APP_SHORT_NAME} is installed and offline-ready</strong>
          <p>{APP_NAME} can launch from your home screen.</p>
        </div>
      </aside>
    )
  }

  if (installPrompt) {
    return (
      <aside className="pwa-install-card">
        <span className="pwa-install-icon" aria-hidden="true">↧</span>
        <div>
          <strong>Install {APP_NAME}</strong>
          <p>Use it like an app and keep core activities available offline.</p>
        </div>
        <button type="button" onClick={install}>Install</button>
      </aside>
    )
  }

  if (ios) {
    return (
      <aside className="pwa-install-card">
        <span className="pwa-install-icon" aria-hidden="true">＋</span>
        <div>
          <strong>Add {APP_SHORT_NAME} to your Home Screen</strong>
          <p>In Safari, tap Share, then choose Add to Home Screen.</p>
        </div>
      </aside>
    )
  }

  return null
}
