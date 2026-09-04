const phases = [
  { tamil: 'பூரகம்', english: 'INHALE', detail: 'Left nostril', multiplier: 1, className: 'inhale' },
  { tamil: 'கும்பகம்', english: 'HOLD', detail: 'Retain', multiplier: 4, className: 'hold' },
  { tamil: 'ரேசகம்', english: 'EXHALE', detail: 'Right nostril', multiplier: 2, className: 'exhale' },
]

const circumference = 2 * Math.PI * 54
const baseKey = 'thirumoolar:base-unit'

const orb = document.getElementById('orb')
const phaseTamil = document.getElementById('phaseTamil')
const phaseEnglish = document.getElementById('phaseEnglish')
const phaseDetail = document.getElementById('phaseDetail')
const timer = document.getElementById('timer')
const progressRing = document.getElementById('progressRing')
const baseInput = document.getElementById('baseUnit')
const durationsLabel = document.getElementById('durations')
const cycleLabel = document.getElementById('cycleLabel')
const ratioLabel = document.getElementById('ratioLabel')
const decreaseButton = document.getElementById('decrease')
const increaseButton = document.getElementById('increase')
const startButton = document.getElementById('start')
const stopButton = document.getElementById('stop')
const phasePills = [...document.querySelectorAll('.phase-pill')]

let running = false
let phaseIndex = 0
let cycle = 0
let baseUnit = clampBase(Number(localStorage.getItem(baseKey)) || 4)
let durations = [baseUnit, baseUnit * 4, baseUnit * 2]
let stageStartedAt = 0
let stageEndsAt = 0
let timerId = null
let audioContext = null

progressRing.style.strokeDasharray = String(circumference)
progressRing.style.strokeDashoffset = String(circumference)
baseInput.value = String(baseUnit)
updateDurations()

function clampBase(value) {
  return Math.max(2, Math.min(16, Math.round(value) || 4))
}

function setBase(value) {
  baseUnit = clampBase(value)
  durations = [baseUnit, baseUnit * 4, baseUnit * 2]
  baseInput.value = String(baseUnit)
  localStorage.setItem(baseKey, String(baseUnit))
  updateDurations()
}

function updateDurations() {
  durationsLabel.textContent = `${baseUnit}s · ${baseUnit * 4}s · ${baseUnit * 2}s`
}

async function unlockAudio() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext()
  }
  if (audioContext.state !== 'running') await audioContext.resume()

  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()
  source.buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate)
  gain.gain.value = 0
  source.connect(gain)
  gain.connect(audioContext.destination)
  source.start(0)
}

async function playChime() {
  if (!audioContext) return
  try {
    if (audioContext.state !== 'running') await audioContext.resume()
    if (audioContext.state !== 'running') return

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime)
    gain.gain.setValueAtTime(0.28, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 2)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 2)
  } catch {
    // Keep the timer usable if audio is unavailable.
  }
}

function setControlsDisabled(disabled) {
  baseInput.disabled = disabled
  decreaseButton.disabled = disabled
  increaseButton.disabled = disabled
  startButton.disabled = disabled
  stopButton.disabled = !disabled
}

function renderPhase(index, secondsLeft, progress) {
  const phase = phases[index]
  phaseTamil.textContent = phase.tamil
  phaseEnglish.textContent = phase.english
  phaseDetail.textContent = phase.detail
  timer.textContent = String(secondsLeft)
  cycleLabel.textContent = `Cycle ${cycle}`
  ratioLabel.textContent = `${durations[0]} · ${durations[1]} · ${durations[2]} sec`

  progressRing.style.strokeDashoffset = String(circumference * (1 - progress))
  phasePills.forEach((pill, pillIndex) => pill.classList.toggle('active', pillIndex === index))

  orb.classList.remove('inhale', 'hold', 'exhale')
  orb.style.setProperty('--phase-duration', `${durations[index]}s`)
  void orb.offsetWidth
  orb.classList.add(phase.className)
}

function beginStage(index, now) {
  phaseIndex = index
  const duration = durations[index]
  stageStartedAt = now
  stageEndsAt = now + duration * 1000
  renderPhase(index, duration, 0)
  void playChime()
}

function tick() {
  if (!running) return
  const now = performance.now()

  if (now >= stageEndsAt) {
    let next = phaseIndex + 1
    if (next >= phases.length) {
      next = 0
      cycle += 1
    }
    beginStage(next, now)
    return
  }

  const remainingMs = Math.max(0, stageEndsAt - now)
  const durationMs = Math.max(1, stageEndsAt - stageStartedAt)
  const progress = Math.max(0, Math.min(1, 1 - remainingMs / durationMs))
  renderPhase(phaseIndex, Math.max(1, Math.ceil(remainingMs / 1000)), progress)
}

async function start() {
  if (running) return
  try {
    await unlockAudio()
  } catch {
    // Chrome normally allows Web Audio from this explicit user gesture.
  }

  setBase(Number(baseInput.value))
  running = true
  cycle = 1
  setControlsDisabled(true)
  beginStage(0, performance.now())
  clearInterval(timerId)
  timerId = setInterval(tick, 100)
}

function stop() {
  if (!running) return
  running = false
  clearInterval(timerId)
  timerId = null
  setControlsDisabled(false)

  orb.classList.remove('inhale', 'hold', 'exhale')
  phasePills.forEach((pill) => pill.classList.remove('active'))
  progressRing.style.strokeDashoffset = String(circumference)
  phaseTamil.textContent = 'Session ended'
  phaseEnglish.textContent = '1 : 4 : 2'
  phaseDetail.textContent = 'Ready when you are'
  timer.textContent = '--'
  cycleLabel.textContent = cycle ? `${cycle} cycle${cycle === 1 ? '' : 's'}` : 'Ready'
  ratioLabel.textContent = 'Purakam · Kumbakam · Rechakam'
}

decreaseButton.addEventListener('click', () => setBase(baseUnit - 1))
increaseButton.addEventListener('click', () => setBase(baseUnit + 1))
baseInput.addEventListener('change', () => setBase(Number(baseInput.value)))
startButton.addEventListener('click', () => void start())
stopButton.addEventListener('click', stop)

window.addEventListener('pagehide', () => {
  clearInterval(timerId)
  if (audioContext && audioContext.state !== 'closed') void audioContext.close()
})
