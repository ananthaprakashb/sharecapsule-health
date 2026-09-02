import { useRef, useState } from 'react'
import { activeRecallActivity } from '../activities/library'
import { APP_SHORT_NAME } from '../brand'
import { saveLearningReflection } from '../storage/foundations'
import { recordCompletion } from '../storage/progress'

type ActiveRecallPageProps = { onBack: () => void; onDone: () => void; nextLabel?: string }

export function ActiveRecallPage({ onBack, onDone, nextLabel }: ActiveRecallPageProps) {
  const [topic, setTopic] = useState('')
  const [remembered, setRemembered] = useState('')
  const [missed, setMissed] = useState('')
  const [keyIdea, setKeyIdea] = useState('')
  const [stage, setStage] = useState<'recall' | 'review' | 'done'>('recall')
  const startedAtRef = useRef(Date.now())
  const savedRef = useRef(false)

  function finish() {
    if (savedRef.current) return
    const createdAt = new Date().toISOString()
    const durationSeconds = Math.max(30, Math.min(30 * 60, Math.round((Date.now() - startedAtRef.current) / 1000)))
    recordCompletion({ activityId: activeRecallActivity.id, completedAt: createdAt, durationSeconds })
    saveLearningReflection({ id: `${Date.now()}-recall`, createdAt, kind: 'recall', topic: topic.trim() || undefined, keyIdea: keyIdea.trim() || undefined })
    savedRef.current = true
    setStage('done')
  }

  return <main className="page-shell phase9-focus-page">
    <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label={`Back to ${APP_SHORT_NAME}`}>←</button><div><p className="eyebrow">Learn · Memory</p><h1>Active Recall</h1></div></header>
    <section className="phase9-feature-card"><span aria-hidden="true">🧠</span><div><h2>Close the source. Pull the idea from memory.</h2><p>Retrieving what you learned is the practice. You do not need a perfect answer—notice what comes back and what needs another look.</p></div></section>
    <section className="settings-section"><label className="phase9-field"><span><strong>What are you recalling?</strong><small>Optional topic, chapter, meeting or concept.</small></span><input className="phase9-text-input" value={topic} maxLength={120} onChange={(event) => setTopic(event.target.value)} placeholder="Example: chapter 3, React rendering, biology notes" disabled={stage === 'done'} /></label></section>
    <section className="settings-section"><p className="eyebrow">1 · Recall without looking</p><h2>What can you explain from memory?</h2><textarea className="phase9-textarea" rows={7} value={remembered} onChange={(event) => setRemembered(event.target.value)} maxLength={2500} placeholder="Write freely. Do not check the source yet." disabled={stage !== 'recall'} />{stage === 'recall' ? <button className="primary-button phase9-wide-button" type="button" disabled={!remembered.trim()} onClick={() => setStage('review')}>Now check the source</button> : null}</section>
    {stage !== 'recall' ? <section className="settings-section"><p className="eyebrow">2 · Review the gaps</p><h2>What did you miss or misunderstand?</h2><textarea className="phase9-textarea" rows={5} value={missed} onChange={(event) => setMissed(event.target.value)} maxLength={1800} placeholder="Compare with the source and note the gaps." disabled={stage === 'done'} /><label className="phase9-field"><span><strong>One idea to remember next time</strong></span><textarea className="phase9-textarea" rows={3} value={keyIdea} onChange={(event) => setKeyIdea(event.target.value)} maxLength={600} placeholder="Keep the takeaway simple." disabled={stage === 'done'} /></label>{stage === 'review' ? <button className="primary-button phase9-wide-button" type="button" onClick={finish}>Complete recall</button> : null}</section> : null}
    {stage === 'done' ? <section className="phase9-complete-card"><span aria-hidden="true">✓</span><div><h2>Recall completed</h2><p>Vital saved only the topic and your short key idea locally. The full recall and gap notes stay on this screen and are not stored.</p></div><button className="primary-button" type="button" onClick={onDone}>{nextLabel ?? 'Done'}</button></section> : null}
  </main>
}
