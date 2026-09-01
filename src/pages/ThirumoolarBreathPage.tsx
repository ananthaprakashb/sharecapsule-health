import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { recordCompletion } from '../storage/progress'

type ThirumoolarBreathPageProps = {
  onBack: () => void
}

type AudioSessionNavigator = Navigator & {
  audioSession?: {
    type?: string
  }
}

type SafariAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

const phases = [
  { tamil: 'பூரகம்', english: 'INHALE', detail: 'Left nostril', shortDetail: 'Inhale · Left', className: 'phase-inhale', multiplier: 1 },
  { tamil: 'கும்பகம்', english: 'HOLD', detail: 'Retain', shortDetail: 'Hold', className: 'phase-hold', multiplier: 4 },
  { tamil: 'ரேசகம்', english: 'EXHALE', detail: 'Right nostril', shortDetail: 'Exhale · Right', className: 'phase-exhale', multiplier: 2 },
] as const

const circumference = 2 * Math.PI * 56

export function ThirumoolarBreathPage({ onBack }: ThirumoolarBreathPageProps) {
  const [baseUnit, setBaseUnit] = useState(4)
  const [running, setRunning] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const phaseIndexRef = useRef(0)
  const cycleRef = useRef(0)
  const durationsRef = useRef([4, 16, 8])
  const stageStartedAtRef = useRef(0)
  const stageEndsAtRef = useRef(0)
  const sessionStartedAtRef = useRef<number | null>(null)

  const phase = phases[phaseIndex]
  const phaseDuration = durationsRef.current[phaseIndex] ?? baseUnit * phase.multiplier

  function clampBase(value: number) {
    return Math.max(2, Math.min(16, Math.round(value) || 4))
  }

  function configureAudioSession() {
    try {
      const audioSession = (navigator as AudioSessionNavigator).audioSession
      if (audioSession && 'type' in audioSession) audioSession.type = 'playback'
    } catch {
      // Audio Session API is optional and browser-specific.
    }
  }

  async function unlockAudio() {
    const safariWindow = window as SafariAudioWindow
    const AudioContextClass = window.AudioContext || safariWindow.webkitAudioContext
    if (!AudioContextClass) return false

    configureAudioSession()

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContextClass()
    }

    const audioContext = audioContextRef.current

    try {
      if (audioContext.state !== 'running') await audioContext.resume()

      // Prime Web Audio directly from the user's Start tap. iOS Safari and
      // installed PWAs can otherwise keep later timer-triggered audio muted.
      const source = audioContext.createBufferSource()
      const gain = audioContext.createGain()
      source.buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate)
      gain.gain.value = 0
      source.connect(gain)
      gain.connect(audioContext.destination)
      source.start(0)

      return audioContext.state === 'running'
    } catch {
      return false
    }
  }

  async function playChime() {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    try {
      if (audioContext.state !== 'running') await audioContext.resume()
      if (audioContext.state !== 'running') return

      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(528, audioContext.currentTime)
      gain.gain.setValueAtTime(0.34, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 2)
      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 2)
    } catch {
      // Keep the breathing timer usable even if a browser blocks audio.
    }
  }

  function beginStage(index: number, now: number) {
    phaseIndexRef.current = index
    setPhaseIndex(index)

    const duration = durationsRef.current[index]
    stageStartedAtRef.current = now
    stageEndsAtRef.current = now + duration * 1000
    setSecondsLeft(duration)
    setPhaseProgress(0)
    void playChime()
  }

  function tick() {
    if (!runningRef.current) return

    const now = performance.now()
    const sessionStartedAt = sessionStartedAtRef.current
    if (sessionStartedAt !== null) {
      setElapsed(Math.max(0, Math.floor((now - sessionStartedAt) / 1000)))
    }

    if (now >= stageEndsAtRef.current) {
      let nextPhase = phaseIndexRef.current + 1
      if (nextPhase >= phases.length) {
        nextPhase = 0
        cycleRef.current += 1
        setCurrentCycle(cycleRef.current)
      }
      beginStage(nextPhase, now)
      return
    }

    const remainingMs = Math.max(0, stageEndsAtRef.current - now)
    const durationMs = Math.max(1, stageEndsAtRef.current - stageStartedAtRef.current)
    setSecondsLeft(Math.max(1, Math.ceil(remainingMs / 1000)))
    setPhaseProgress(Math.max(0, Math.min(1, 1 - remainingMs / durationMs)))
  }

  async function startSession() {
    if (runningRef.current) return

    // This must happen inside the Start button gesture for reliable iOS/PWA audio.
    await unlockAudio()

    const base = clampBase(baseUnit)
    setBaseUnit(base)
    durationsRef.current = [base, base * 4, base * 2]
    runningRef.current = true
    setRunning(true)
    setSessionEnded(false)
    cycleRef.current = 1
    setCurrentCycle(1)
    setElapsed(0)
    sessionStartedAtRef.current = performance.now()
    beginStage(0, performance.now())

    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(tick, 100)
  }

  function recordSession() {
    if (elapsed < 5) return

    recordCompletion({
      activityId: 'thirumoolar-1-4-2',
      completedAt: new Date().toISOString(),
      durationSeconds: elapsed,
      cycles: currentCycle,
    })
  }

  function stopSession({ save = true }: { save?: boolean } = {}) {
    if (save && runningRef.current) recordSession()

    runningRef.current = false
    setRunning(false)
    setSessionEnded(true)

    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null

    setPhaseProgress(0)
  }

  function goBack() {
    if (runningRef.current) stopSession()
    onBack()
  }

  useEffect(() => {
    function restoreAudio() {
      if (!runningRef.current) return
      configureAudioSession()
      const audioContext = audioContextRef.current
      if (audioContext && audioContext.state !== 'running') {
        void audioContext.resume()
      }
      tick()
    }

    function onVisibilityChange() {
      if (!document.hidden) restoreAudio()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pageshow', restoreAudio)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', restoreAudio)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      runningRef.current = false
    }
  }, [])

  const stageName = running
    ? `${phase.tamil} · ${phase.english}`
    : sessionEnded
      ? 'Session ended'
      : 'Ready to begin'

  const stageDetail = running ? phase.detail : '1 : 4 : 2'
  const ringOffset = circumference * (1 - phaseProgress)

  return (
    <main className="legacy-breath-page">
      <div className="legacy-breath-app">
        <button className="legacy-breath-back" type="button" onClick={goBack} aria-label="Back to ShareCapsule Health">
          ← Health
        </button>

        <section className="legacy-breath-card" aria-label="Thirumoolar Pranayama breathing guide">
          <header className="legacy-breath-title">
            <div className="legacy-breath-mark"><img src="/app-icon.svg" alt="" /></div>
            <h1>Thirumoolar Pranayama</h1>
            <p className="legacy-breath-subtitle">Continuous guided breathwork · single bell chime</p>
            <div className="legacy-breath-ratio">
              <span>Purakam</span><i></i><span>Kumbakam</span><i></i><span>Rechakam</span> · 1:4:2
            </div>
          </header>

          <div className="legacy-breath-visual">
            <div className="legacy-breath-halo"></div>
            <svg className="legacy-breath-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="track" cx="60" cy="60" r="56"></circle>
              <circle
                className="progress"
                cx="60"
                cy="60"
                r="56"
                style={{ strokeDasharray: circumference, strokeDashoffset: ringOffset }}
              ></circle>
            </svg>

            <div
              className={`legacy-breath-orb ${running ? phase.className : ''}`}
              style={{ '--phase-duration': `${phaseDuration}s` } as CSSProperties}
            >
              <div className="legacy-breath-phase-copy" aria-live="polite">
                <div className="legacy-breath-phase-name">{stageName}</div>
                <div className="legacy-breath-phase-detail">{stageDetail}</div>
                <div className="legacy-breath-timer">
                  {running ? <>{secondsLeft}<small>s</small></> : '--'}
                </div>
                <div className="legacy-breath-cycle">
                  {running ? `Continuous cycle ${currentCycle}` : `Cycle ${currentCycle}`}
                </div>
              </div>
            </div>
          </div>

          <div className="legacy-breath-phase-strip" aria-label="Breathing phases">
            {phases.map((item, index) => (
              <div className={`legacy-breath-phase-pill ${running && phaseIndex === index ? 'active' : ''}`} key={item.english}>
                <strong>{item.tamil}</strong>
                <span>{item.shortDetail}</span>
              </div>
            ))}
          </div>

          <div className="legacy-breath-settings">
            <div className="legacy-breath-settings-copy">
              <label htmlFor="baseUnit">Inhale base unit</label>
              <div className="legacy-breath-durations">{baseUnit}s inhale · {baseUnit * 4}s hold · {baseUnit * 2}s exhale</div>
            </div>
            <div className="legacy-breath-unit-control">
              <button
                type="button"
                aria-label="Decrease base unit"
                disabled={running}
                onClick={() => setBaseUnit((value) => clampBase(value - 1))}
              >−</button>
              <input
                id="baseUnit"
                type="number"
                value={baseUnit}
                min="2"
                max="16"
                inputMode="numeric"
                aria-label="Inhale base unit in seconds"
                disabled={running}
                onChange={(event) => setBaseUnit(clampBase(Number(event.target.value)))}
              />
              <button
                type="button"
                aria-label="Increase base unit"
                disabled={running}
                onClick={() => setBaseUnit((value) => clampBase(value + 1))}
              >+</button>
            </div>
          </div>

          <div className="legacy-breath-actions">
            <button className="legacy-breath-start" type="button" disabled={running} onClick={startSession}>Start breathing</button>
            <button className="legacy-breath-stop" type="button" disabled={!running} onClick={() => stopSession()}>Stop</button>
          </div>
        </section>
      </div>
    </main>
  )
}
