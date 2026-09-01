import { ActivityCard } from '../components/ActivityCard'
import { thirumoolarBreath } from '../activities/thirumoolar'
import { getTodaySummary } from '../storage/progress'

type HomePageProps = {
  onOpenThirumoolar: () => void
}

const upcoming = [
  { icon: '🧘', title: 'Meditate', detail: 'Guided relaxation', status: 'Coming next' },
  { icon: '🤸', title: 'Stretch', detail: 'Gentle mobility break', status: 'Coming next' },
  { icon: '🚶', title: 'Walk', detail: 'Mindful walking timer', status: 'Coming next' },
]

export function HomePage({ onOpenThirumoolar }: HomePageProps) {
  const summary = getTodaySummary()

  return (
    <main className="page-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">ShareCapsule</p>
          <h1>Health</h1>
        </div>
        <span className="brand-mark" aria-hidden="true">♥</span>
      </header>

      <section className="hero-card">
        <p className="eyebrow">Today</p>
        <h2>Take a few minutes for yourself.</h2>
        <p>Small, guided wellness activities that fit naturally into your day.</p>
        <div className="today-stats" aria-label="Today's progress">
          <div><strong>{summary.activities}</strong><span>activities</span></div>
          <div><strong>{summary.minutes}</strong><span>minutes</span></div>
          <div><strong>Local</strong><span>private progress</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Start now</p>
            <h2>Breathing</h2>
          </div>
        </div>
        <ActivityCard activity={thirumoolarBreath} onOpen={onOpenThirumoolar} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Growing library</p>
            <h2>More ways to reset</h2>
          </div>
        </div>
        <div className="coming-grid">
          {upcoming.map((item) => (
            <article className="coming-card" key={item.title}>
              <span className="coming-icon" aria-hidden="true">{item.icon}</span>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
              <small>{item.status}</small>
            </article>
          ))}
        </div>
      </section>

      <footer className="app-footer">Wellness guidance, not medical treatment.</footer>
    </main>
  )
}
