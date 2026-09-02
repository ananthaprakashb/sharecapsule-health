import { useEffect, useRef, useState } from 'react'
import { gratitudeActivity } from '../activities/library'
import { APP_NAME, APP_SHORT_NAME } from '../brand'
import { getGratitudeSummary, recordGratitudeMoment } from '../storage/gratitude'
import { recordCompletion } from '../storage/progress'

type GratitudePageProps = { onBack: () => void }

type RecorderSupport = {
  supported: boolean
  reason?: string
}

function isAppleWebKit() {
  const userAgent = navigator.userAgent
  const ios = /iPhone|iPad|iPod/i.test(userAgent)
  const safariOnMac = /Macintosh/i.test(userAgent) && /Safari/i.test(userAgent) && !/Chrome|Chromium|Edg/i.test(userAgent)
  return ios || safariOnMac
}

function getRecorderSupport(): RecorderSupport {
  if (!window.isSecureContext) {
    return { supported: false, reason: 'Voice recording needs a secure HTTPS connection. Open Vital from https://health.sharecapsule.org and try again.' }
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return { supported: false, reason: 'This browser does not expose microphone recording. You can write the thank-you instead.' }
  }
  if (!('MediaRecorder' in window)) {
    return { supported: false, reason: 'This browser does not support the voice recorder. You can write the thank-you instead.' }
  }
  return { supported: true }
}

function pickMimeType() {
  if (!('MediaRecorder' in window) || !MediaRecorder.isTypeSupported) return ''
  const candidates = isAppleWebKit()
    ? ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

function createRecorder(stream: MediaStream) {
  // Safari/WebKit is most reliable when it chooses its native recording format
  // (normally MP4/AAC). Other browsers benefit from an explicit supported type.
  if (isAppleWebKit()) {
    try {
      return new MediaRecorder(stream)
    } catch {
      // Fall through to an explicitly supported type.
    }
  }
  const mimeType = pickMimeType()
  return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
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

function captureErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Microphone access was denied. Allow microphone access for this site/app in your browser settings, then try again.'
    if (error.name === 'NotFoundError') return 'No microphone was found on this device. You can write the thank-you instead.'
    if (error.name === 'NotReadableError') return 'The microphone is currently unavailable, possibly because another app is using it. Close the other recording app and try again.'
    if (error.name === 'SecurityError') return 'The browser blocked microphone access. Make sure you are using the HTTPS version of Vital and microphone permission is allowed.'
    if (error.name === 'AbortError') return 'Microphone recording was interrupted. Please try again.'
    return `Microphone recording could not start (${error.name}). You can retry or write the thank-you instead.`
  }
  return 'Microphone recording could not start. You can retry or write the thank-you instead.'
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
  const audioUrlRef = useRef('')
  const completionRecordedRef = useRef(false)
  const startedRecordingAtRef = useRef(0)
  const practiceStartedAtRef = useRef(Date.now())
  const tickerRef = useRef<number | null>(null)
  const maxTimerRef = useRef<number | null>(null)
  const recorderSupport = getRecorderSupport()

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
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioUrlRef.current = ''
    setAudioUrl('')
    setAudioBlob(null)
    setRecordedSeconds(0)
  }

  function setRecordedAudio(blob: Blob) {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    const url = URL.createObjectURL(blob)
    audioUrlRef.current = url
    setAudioBlob(blob)
    setAudioUrl(url)
  }

  useEffect(() => () => {
    clearTimers()
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.stop() } catch { /* Recorder is already shutting down. */ }
    }
    stopStream()
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
  }, [])

  function stopRecording() {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      setStatus('Finishing recording…')
      try {
        recorder.stop()
      } catch {
        setRecording(false)
        clearTimers()
        stopStream()
        setStatus('The recorder could not finish cleanly. Please try recording again.')
      }
    }
  }

  async function startRecording() {
    const support = getRecorderSupport()
    if (!support.supported) {
      setWriting(true)
      setStatus(support.reason ?? 'Voice recording is unavailable in this browser.')
      return
    }

    clearAudio()
    setWrittenNote('')
    setWriting(false)
    setStatus('Requesting microphone access…')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioTrack = stream.getAudioTracks()[0]
      if (!audioTrack) {
        stream.getTracks().forEach((track) => track.stop())
        setWriting(true)
        setStatus('The browser did not provide an audio track. You can write the thank-you instead.')
        return
      }

      streamRef.current = stream
      chunksRef.current = []
      const recorder = createRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        setRecording(false)
        clearTimers()
        stopStream()
        setStatus('The browser reported a recording error. Please try again, or use the written option.')
      }

      recorder.onstop = () => {
        const seconds = Math.max(1, Math.round((Date.now() - startedRecordingAtRef.current) / 1000))
        const type = recorder.mimeType || (chunksRef.current[0] instanceof Blob ? chunksRef.current[0].type : '') || pickMimeType() || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })

        recorderRef.current = null
        setRecording(false)
        clearTimers()
        stopStream()

        if (!blob.size) {
          setAudioBlob(null)
          setAudioUrl('')
          setRecordedSeconds(0)
          setStatus('No audio data was captured. Check microphone permission and try again. If this persists, use Write instead.')
          return
        }

        setRecordedSeconds(seconds)
        setRecordedAudio(blob)
        setStatus(`Recording ready (${Math.max(1, Math.round(blob.size / 1024))} KB). Listen before you decide whether to share it.`)
      }

      startedRecordingAtRef.current = Date.now()
      recorder.start()
      setRecording(true)
      setRecordedSeconds(0)
      setStatus('Recording… speak naturally, then tap Stop recording.')
      tickerRef.current = window.setInterval(() => setRecordedSeconds(Math.min(90, Math.round((Date.now() - startedRecordingAtRef.current) / 1000))), 500)
      maxTimerRef.current = window.setTimeout(stopRecording, 90_000)
    } catch (error) {
      recorderRef.current = null
      setRecording(false)
      clearTimers()
      stopStream()
      setWriting(true)
      setStatus(captureErrorMessage(error))
    }
  }

  function complete(outcome: 'shared' | 'private') {
    if (completionRecordedRef.current || done) return false
    if (!audioBlob && !writtenNote.trim()) {
      setStatus('Record a voice message or write a note before completing this practice.')
      return false
    }

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

    completionRecordedRef.current = true
    setDone(true)
    const summary = getGratitudeSummary()
    const monthLabel = `${summary.thisMonth} gratitude moment${summary.thisMonth === 1 ? '' : 's'} this month.`
    setStatus(outcome === 'shared'
      ? `Thank-you shared and saved. ${monthLabel}`
      : `Private gratitude moment saved. ${monthLabel}`)
    return true
  }

  async function shareMessage() {
    const name = recipient.trim() || 'someone'
    if (audioBlob) {
      const file = new File([audioBlob], `thank-you-${safeName(name)}-${new Date().toISOString().slice(0, 10)}.${extensionFor(audioBlob.type)}`, { type: audioBlob.type || 'audio/webm' })
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        try {
          await navigator.share({ title: `A thank-you for ${name}`, text: `I recorded a short thank-you for you with ${APP_NAME}.`, files: [file] })
          complete('shared')
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            setStatus('Share canceled. Nothing was added to your gratitude progress.')
            return
          }
        }
      }
      downloadRecording()
      setStatus('Your browser could not share the audio file directly, so it was downloaded. Attach it in your messaging app, then use Mark as shared below.')
      return
    }

    if (writtenNote.trim()) {
      const text = `${recipient.trim() ? `${recipient.trim()},\n\n` : ''}${writtenNote.trim()}`
      if (navigator.share) {
        try {
          await navigator.share({ title: 'A thank-you', text })
          complete('shared')
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            setStatus('Share canceled. Nothing was added to your gratitude progress.')
            return
          }
        }
      }
      setStatus('Sharing is not supported here. Copy your note into the messaging app you use, then use Mark as shared below.')
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

  return (
    <main className="page-shell phase8-gratitude-page">
      <header className="subpage-header"><button className="icon-button" type="button" onClick={onBack} aria-label={`Back to ${APP_SHORT_NAME}`}>←</button><div><p className="eyebrow">Connection practice</p><h1>Thank someone</h1></div></header>
      <section className="phase8-intro-card"><span aria-hidden="true">💛</span><div><h2>Think of someone you do not see every day.</h2><p>Choose someone whose kindness, help, teaching or presence made a difference. A short, specific thank-you is enough.</p></div></section>
      <section className="settings-section"><p className="eyebrow">1 · Remember</p><h2>Who came to mind?</h2><label className="phase8-name-field"><span><strong>Name or nickname</strong><small>Optional. Stored only on this device if you complete the practice.</small></span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} maxLength={80} placeholder="Someone you appreciate" /></label><div className="phase8-prompt"><strong>A simple message can have three parts:</strong><ol><li>What they did or what you remember.</li><li>Why it mattered to you.</li><li>What you want them to know now.</li></ol></div></section>
      <section className="settings-section"><p className="eyebrow">2 · Express</p><h2>Record your thank-you</h2><p className="settings-intro">About 20–90 seconds works well. {APP_NAME} does not save the raw recording to your history.</p>{!recorderSupport.supported ? <p className="phase6-status" role="status">{recorderSupport.reason}</p> : null}<div className={`phase8-recorder ${recording ? 'recording' : ''}`}><span className="phase8-mic" aria-hidden="true">{recording ? '●' : '🎙️'}</span><strong>{recording ? 'Recording…' : audioBlob ? 'Recording ready' : 'Ready when you are'}</strong><b>{Math.floor(recordedSeconds / 60)}:{String(recordedSeconds % 60).padStart(2, '0')}</b><div className="phase8-record-actions">{recording ? <button className="primary-button" type="button" onClick={stopRecording}>Stop recording</button> : <button className="primary-button" type="button" onClick={startRecording}>{audioBlob ? 'Record again' : 'Start voice message'}</button>}<button type="button" onClick={() => setWriting((value) => !value)}>Write instead</button></div></div>{audioUrl ? <audio className="phase8-audio" controls preload="metadata" src={audioUrl}>Your browser cannot play this recording.</audio> : null}{writing ? <label className="phase8-write"><span><strong>Written fallback</strong><small>Useful when microphone recording is unavailable.</small></span><textarea rows={5} maxLength={1200} value={writtenNote} onChange={(event) => setWrittenNote(event.target.value)} placeholder="Thank you for…" /></label> : null}{status ? <p className="phase6-status" role="status" aria-live="polite">{status}</p> : null}</section>
      <section className="settings-section"><p className="eyebrow">3 · Connect</p><h2>Share it—or keep the reflection private</h2><p className="settings-intro">A successful Share thank-you action is saved automatically. For downloaded/manual sharing, use Mark as shared. You can also keep the reflection private.</p><div className="phase8-share-actions"><button className="primary-button" type="button" onClick={shareMessage} disabled={done || (!audioBlob && !writtenNote.trim())}>{done ? 'Gratitude saved' : 'Share thank-you'}</button>{audioBlob && !done ? <button type="button" onClick={downloadRecording}>Download audio</button> : null}</div><div className="phase8-complete-actions"><button type="button" onClick={() => complete('shared')} disabled={done}>Mark as shared</button><button type="button" onClick={() => complete('private')} disabled={done}>Keep this reflection private</button></div></section>
      <section className="settings-section settings-privacy"><p className="eyebrow">A gentle habit</p><h2>No gratitude streak pressure</h2><p>{APP_SHORT_NAME} tracks gratitude moments so you can notice the habit over time, but it does not rank or score who you thank. A sincere occasional message is more important than a number.</p></section>
    </main>
  )
}
