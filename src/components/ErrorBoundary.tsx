import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ShareCapsule Health render error', error, info)
  }

  private reload = () => window.location.reload()

  private clearCachedApp = async () => {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key.startsWith('sharecapsule-health-')).map((key) => caches.delete(key)))
    }
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="phase5-error-page">
        <section>
          <span aria-hidden="true">♥</span>
          <p className="eyebrow">ShareCapsule Health</p>
          <h1>We couldn't open this screen.</h1>
          <p>Your local wellness history has not been cleared. Try reloading first; if the installed PWA has stale files, refresh only the app cache.</p>
          <div>
            <button className="primary-button" type="button" onClick={this.reload}>Reload app</button>
            <button className="secondary-button" type="button" onClick={this.clearCachedApp}>Refresh app files</button>
          </div>
        </section>
      </main>
    )
  }
}
