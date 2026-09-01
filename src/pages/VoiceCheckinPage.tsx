import { useEffect, useRef, useState } from 'react'
import { APP_NAME } from '../brand'
import { CHECKIN_MOODS, getMoodLabel, readCheckins, saveCheckin, suggestMoodFromSelfReport } from '../storage/checkins'
import type { CheckinMood } from '../storage/checkins'

type VoiceCheckinPageProps = { onBack: () => void }
type SpeechAlternativeLike = { transcript: string }
type SpeechResultLike = { [index: number]: SpeechAlternativeLike; length: number }
type SpeechEventLike = { results: ArrayLike<SpeechResultLike> }
type SpeechErrorLike = { error?: string }
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: SpeechEventLike) => void) | null
  onerror: ((event: SpeechErrorLike) => void) | null
  start: () => void
  stop: () => void
  abort?: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type VoiceWindow = Window & typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

function getSpeechRecognitionConstructor() {
  const voiceWindow = window as VoiceWindow
  return voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition ?? null
}

function newId() {
  return crypto.randomUUID?.() ?? `checkin-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function VoiceCheckinPage({ onBack }: VoiceCheckinPageProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const usedVoiceRef = useRef(false)
  const [speechSupported] = useState(() => Boolean(getSpeechRecognitionConstructor()))
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [suggestedMood, setSuggestedMood] = useState<CheckinMood | null>(null)
  const [selectedMood, setSelectedMood] = useState<CheckinMood | null>(null)
  const [saveWords, setSaveWords] = useState(false)
  const [status, setStatus] = useState('')
  const [recent, setRecent] = useState(readCheckins)

  useEffect(() => () => recognitionRef.current?.abort?.(), [])

  function updateTranscript(value: string) {
    setTranscript(value)
    setSuggestedMood(suggestMoodFromSelfReport(value))
  }

  function startListening() {
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      setStatus('Voice-to-text is not available in this browser. You can type your answer and still save a check-in.')
      return
    }

    const recognition = new Recognition()
    recognition.lang = navigator.language || 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => { usedVoiceRef.current = true; setListening(true); setStatus('Listening… speak naturally, then pause.') }
    recognition.onresult = (event) => {
      let text = ''
      for (let index = 0; index < event.results.length; index += 1) text += `${event.results[index]?.[0]?.transcript ?? ''} `
      updateTranscript(text.trim())
    }
    recognition.onerror = (event) => {
      setListening(false)
      setStatus(event.error === 'not-allowed' ? 'Microphone access was not allowed. You can type your answer instead.' : 'Voice recognition stopped. You can try again or type your answer.')
    }
    recognition.onend = () => { setListening(false); setStatus((current) => current === 'Listening… speak naturally, then pause.' ? 'Voice input finished. Confirm how you feel below.' : current) }
    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setStatus('Voice recognition could not start. You can type your answer instead.')
    }
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function save() {
    if (!selectedMood) {
      setStatus('Choose the mood that best matches how you feel before saving.')
      return
    }

    const checkins = saveCheckin({
      id: newId(),
      createdAt: new Date().toISOString(),
      mood: selectedMood,
      source: usedVoiceRef.current ? 'voice' : 'typed',
      note: saveWords && transcript.trim() ? transcript.trim().slice(0, 500) : undefined,
    })
    setRecent(checkins)
    setTranscript('')
    setSuggestedMood(null)
    setSelectedMood(null)
    setSaveWords(false)
    usedVoiceRef.current = false
    setStatus(`Check-in saved locally. ${APP_NAME} did not save raw audio.`)
  }

  return (
    <main className="page-shell phase7-checkin-page">
      <header className="subpage-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">←</button>
        <div><p className="eyebrow">A moment for yourself</p><h1>Voice check-in</h1></div>
      </header>

      <section className="settings-section phase7-prompt-card">
        <p className="eyebrow">Question</p>
        <h2>How are you feeling right now?</h2>
        <p>Say what you notice about your mood, energy, or stress level. This is a self-report check-in—not a diagnosis or emotion detector.</p>
        <div className="phase7-voice-actions">
          <button className="primary-button" type="button" onClick={listening ? stopListening : startListening}>{listening ? 'Stop listening' : '🎙 Start voice answer'}</button>
          {!speechSupported ? <small>Voice-to-text is unavailable here; typing still works.</small> : null}
        </div>
      </section>

      <section className="settings-section">
        <p className="eyebrow">Your words</p><h2>Review what you said</h2>
        <p className="settings-intro">Speech recognition is provided by your browser/device. {APP_NAME} does not store the raw microphone audio.</p>
        <textarea className="phase7-transcript" rows={4} value={transcript} placeholder="Your spoken answer appears here, or type how you feel…" onChange={(event) => { usedVoiceRef.current = false; updateTranscript(event.target.value) }} />
        {suggestedMood ? <p className="phase7-suggestion" role="status">From the words you used, you may be describing yourself as <strong>{getMoodLabel(suggestedMood)}</strong>. Please confirm or choose another option.</p> : <p className="phase7-suggestion muted">We only suggest a mood when your words explicitly describe one. Your choice below is the value that gets saved.</p>}
      </section>

      <section className="settings-section">
        <p className="eyebrow">Confirm</p><h2>How would you label it?</h2>
        <div className="phase7-mood-grid" role="group" aria-label="Choose your current mood">
          {CHECKIN_MOODS.map((item) => <button key={item.id} type="button" className={selectedMood === item.id ? 'selected' : ''} aria-pressed={selectedMood === item.id} onClick={() => setSelectedMood(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
        </div>
        <label className="setting-row phase7-save-words"><span><strong>Save my words</strong><small>Off by default. When off, only your confirmed mood and timestamp are saved.</small></span><input type="checkbox" checked={saveWords} onChange={(event) => setSaveWords(event.target.checked)} /></label>
        <button className="primary-button phase7-save-button" type="button" onClick={save} disabled={!selectedMood}>Save check-in</button>
        {status ? <p className="phase6-status" role="status">{status}</p> : null}
      </section>

      <section className="settings-section">
        <p className="eyebrow">Recent</p><h2>Your check-ins</h2>
        {recent.length ? <div className="phase7-checkin-list">{recent.slice(0, 7).map((item) => <div key={item.id}><span>{CHECKIN_MOODS.find((mood) => mood.id === item.mood)?.icon ?? '💭'}</span><div><strong>{getMoodLabel(item.mood)}</strong><small>{new Date(item.createdAt).toLocaleString()} · {item.source === 'voice' ? 'voice check-in' : 'typed check-in'}</small></div></div>)}</div> : <p className="empty-copy">Your confirmed check-ins will appear here.</p>}
      </section>

      <p className="privacy-note">If you are worried about your wellbeing or safety, use appropriate professional or emergency support rather than relying on this check-in.</p>
    </main>
  )
}
