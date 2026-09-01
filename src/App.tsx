import { useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ThirumoolarBreathPage } from './pages/ThirumoolarBreathPage'

type Route = 'home' | 'thirumoolar'

function routeFromHash(): Route {
  return window.location.hash === '#/breathe/thirumoolar' ? 'thirumoolar' : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(next: Route) {
    window.location.hash = next === 'thirumoolar' ? '/breathe/thirumoolar' : '/'
    setRoute(next)
  }

  return route === 'thirumoolar'
    ? <ThirumoolarBreathPage onBack={() => navigate('home')} />
    : <HomePage onOpenThirumoolar={() => navigate('thirumoolar')} />
}
