import { useEffect, useRef, useState } from 'react'
import { gratitudeActivity } from '../activities/library'
import { recordGratitudeMoment } from '../storage/gratitude'
import { recordCompletion } from '../storage/progress'

type GratitudePageProps = { onBack: () => void }

function pickMimeType() {
  if (!('MediaRecorder' in window) || !MediaRecorder.isTypeSupported) return ''
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

function extensionFor(type: string) {
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('ogg')) return 'ogg'
  return 'webm'
}

function safeName(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return cleaned || 'someone'
}

export function GratitudePage({ onBack }: GratitudePageProps) {
  const [recipient, setRecipient] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordedSeconds, setRecordedSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [writing, setWriting] = useState(false)
  const [writtenNote, setWrittenNote] = useState('')
  const [status, setStatus] = useState('')
  const [done, setDone] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const startedRecordingAtRef = useRef(0)
  const practiceStartedAtRef = useRef(Date.now())
  const tickerRef = useRef<number | null>(null)
  const maxTimerRef = useRef<number | null>(null)
  const canRecord = Boolean(navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window)

  function clearTimers() {
    if (tickerRef.current !== null) window.clearInterval(tickerRef.current)
    if (maxTimerRef.current !== null) window.clearTimeout(maxTimerRef.current)
    tickerRef.current = null
    maxTimerRef.current = null
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function clearAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl('')
    setAudioBlob(null)
    setRecordedSeconds(0)
  }

  useEffect(() => () => {
    clearTimers()
    stopStream()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  function stopRecording() {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }

  async function startRecording() {
    if (!canRecord) { setWriting(true); setStatus('Voice recording is not supported in this browser. You can write the thank-you instead.'); return }
    clearAudio()
    setWrittenNote('')
    setWriting(false)
    setStatus('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mimeType = pickMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const seconds = Math.max(1, Math.round((Date.now() - startedRecordingAtRef.current) / 1000))
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' })
        setRecordedSeconds(seconds)
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setRecording(false)
        clearTimers()
        stopStream()
        setStatus('Recording ready. Listen before you decide whether to share it.')
      }
      startedRecordingAtRef.current = Date.now()
      recorder.start()
      setRecording(true)
      setRecordedSeconds(0)
      tickerRef.current = window.setInterval(() => setRecordedSeconds(Math.min(90, Math.round((Date.now() - startedRecordingAtRef.current) / 1000))), 500)
      maxTimerRef.current = window.setTimeout(stopRecording, 90_000)
    } catch {
      stopStream()
      setWriting(true)
      setStatus('Microphone access was unavailable. You can write the thank-you instead, or try again after checking browser permission.')
    }
  }

  async function shareMessage() {
    const name = recipient.trim() || 'someone'
    if (audioBlob) {
      const file = new File([audioBlob], `thank-you-${safeName(name)}-${new Date().toISOString().slice(0, 10)}.${extensionFor(audioBlob.type)}`, { type: audioBlob.type || 'audio/webm' })
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        try { await navigator.share({ title: `A thank-you for ${name}`, text: `I recorded a short thank-you for you with ShareCapsule Health.`, files: [file] }); setStatus('Share sheet closed. If you sent it, mark this gratitude moment as shared below.'); return } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return }
      }
      downloadRecording()
      setStatus('Your browser could not share the audio file directly, so it was downloaded. Attach it in your messaging app, then mark it as shared.')
      return
    }
    if (writtenNote.trim()) {
      const text = `${recipient.trim() ? `${recipient.trim()},\n\n` : ''}${writtenNote.trim()}`
      if (navigator.share) { try { await navigator.share({ title: 'A thank-you', text }); setStatus('Share sheet closed. If you sent it, mark this gratitude moment as shared below.'); return } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return } }
      setStatus('Sharing is not supported here. Copy your note into the messaging app you use.')
      return
    }
    setStatus('Record a voice message or write a note first.')
  }

  function downloadRecording() {
    if (!audioBlob) return
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `thank-you-${safeName(recipient)}-${new Date().toISOString().slice(0, 10)}.${extensionFor(audioBlob.type)}`
    link.click()
  }

  function complete(outcome: 'shared' | 'private') {
    if (done) return
    if (!audioBlob && !writtenNote.trim()) { setStatus('Record a voice message or write a note before completing this practice.'); return }
    const createdAt = new Date().toISOString()
    recordGratitudeMoment({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt,
      recipient: recipient.trim() || undefined,
      outcome,
      mode: audioBlob ? 'voice' : 'written',
      recordingSeconds: audioBlob ? recordedSeconds : undefined,
    })
    const durationSeconds = Math.min(600, Math.max(1, Math.round((Date.now() - practiceStartedAtRef.current) / 1000)))
    recordCompletion({ activityId: gratitudeActivity.id, completedAt: createdAt, durationSeconds })
    setDone(true)
    setStatus(outcome === 'shared' ? 'Gratitude moment saved as shared. Thank you for making the connection.' : 'Private gratitude moment saved on this device.')
  }

  return (
    <main className="page-shell phase8-gratitude-page">
      <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label="Back to Health">←</button><div><p className="eyebrow">Connection practice</p><h1>Thank someone</h1></div></header>
      <section className="phase8-intro-card"><span aria-hidden="true">💛</span><div><h2>Think of someone you do not see every day.</h2><p>Choose someone whose kindness, help, teaching or presence made a difference. A short, specific thank-you is enough.</p></div></section>
      <section className="settings-section"><p className="eyebrow">1 · Remember</p><h2>Who came to mind?</h2><label className="phase8-name-field"><span><strong>Name or nickname</strong><small>Optional. Stored only on this device if you complete the practice.</small></span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} maxLength={80} placeholder="Someone you appreciate" /></label><div className="phase8-prompt"><strong>A simple message can have three parts:</strong><ol><li>What they did or what you remember.</li><li>Why it mattered to you.</li><li>What you want them to know now.</li></ol></div></section>
      <section className="settings-section"><p className="eyebrow">2 · Express</p><h2>Record your thank-you</h2><p className="settings-intro">About 20–90 seconds works well. ShareCapsule Health does not save the raw recording to your history.</p><div className={`phase8-recorder ${recording ? 'recording' : ''}`}><span className="phase8-mic" aria-hidden="true">{recording ? '●' : '🎙️'}</span><strong>{recording ? 'Recording…' : audioBlob ? 'Recording ready' : 'Ready when you are'}</strong><b>{Math.floor(recordedSeconds / 60)}:{String(recordedSeconds % 60).padStart(2, '0')}</b><div className="phase8-record-actions">{recording ? <button className="primary-button" type="button" onClick={stopRecording}>Stop recording</button> : <button className="primary-button" type="button" onClick={startRecording}>{audioBlob ? 'Record again' : 'Start voice message'}</button>}<button type="button" onClick={() => setWriting((value) => !value)}>Write instead</button></div></div>{audioUrl ? <audio className="phase8-audio" controls src={audioUrl}>Your browser cannot play this recording.</audio> : null}{writing ? <label className="phase8-write"><span><strong>Written fallback</strong><small>Useful when microphone recording is unavailable.</small></span><textarea rows={5} maxLength={1200} value={writtenNote} onChange={(event) => setWrittenNote(event.target.value)} placeholder="Thank you for…" /></label> : null}</section>
      <section className="settings-section"><p className="eyebrow">3 · Connect</p><h2>Share it—or keep the reflection private</h2><p className="settings-intro">Sharing is optional. The device share sheet lets you choose Messages, WhatsApp, email or another compatible app without ShareCapsule reading your contacts.</p><div className="phase8-share-actions"><button className="primary-button" type="button" onClick={shareMessage} disabled={!audioBlob && !writtenNote.trim()}>Share thank-you</button>{audioBlob ? <button type="button" onClick={downloadRecording}>Download audio</button> : null}</div><div className="phase8-complete-actions"><button type="button" onClick={() => complete('shared')} disabled={done}>I shared/sent it</button><button type="button" onClick={() => complete('private')} disabled={done}>Keep this reflection private</button></div>{status ? <p className="phase6-status" role="status">{status}</p> : null}</section>
      <section className="settings-section settings-privacy"><p className="eyebrow">A gentle habit</p><h2>No gratitude streak pressure</h2><p>ShareCapsule tracks gratitude moments so you can notice the habit over time, but it does not rank or score who you thank. A sincere occasional message is more important than a number.</p></section>
    </main>
  )
}
