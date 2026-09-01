import type { ReactNode } from 'react'
import { ConnectivityBanner } from './ConnectivityBanner'
import { PwaUpdateNotice } from './PwaUpdateNotice'

export type AppSection = 'home' | 'routines' | 'progress' | 'settings'

type AppChromeProps = {
  active: AppSection
  onNavigate: (section: AppSection) => void
  children: ReactNode
}

const items: Array<{ id: AppSection; icon: string; label: string }> = [
  { id: 'home', icon: '⌂', label: 'Today' },
  { id: 'routines', icon: '☷', label: 'Routines' },
  { id: 'progress', icon: '◔', label: 'Progress' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

export function AppChrome({ active, onNavigate, children }: AppChromeProps) {
  return (
    <div className="phase3-app">
      <ConnectivityBanner />
      <PwaUpdateNotice />
      {children}
      <nav className="phase3-bottom-nav" aria-label="ShareCapsule Health navigation">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={active === item.id ? 'active' : ''}
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
