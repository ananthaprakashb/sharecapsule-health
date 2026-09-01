type SafariAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

type VibrationNavigator = Navigator & {
  vibrate?: (pattern: number | number[]) => boolean
}

export type CueKind = 'start' | 'transition' | 'complete' | 'reminder'

let audioContext: AudioContext | null = null

export async function unlockCueAudio() {
  const safariWindow = window as SafariAudioWindow
  const AudioContextClass = window.AudioContext || safariWindow.webkitAudioContext
  if (!AudioContextClass) return false

  if (!audioContext || audioContext.state === 'closed') audioContext = new AudioContextClass()

  try {
    if (audioContext.state !== 'running') await audioContext.resume()
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

function scheduleTone(frequency: number, startAt: number, duration: number, volume: number) {
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startAt)
  gain.gain.setValueAtTime(volume, startAt)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration)
}

export async function playCue(kind: CueKind) {
  if (!audioContext || audioContext.state !== 'running') {
    const ready = await unlockCueAudio()
    if (!ready || !audioContext) return
  }

  const now = audioContext.currentTime
  if (kind === 'complete') {
    scheduleTone(528, now, 0.55, 0.18)
    scheduleTone(660, now + 0.18, 0.65, 0.14)
    return
  }

  if (kind === 'reminder') {
    scheduleTone(392, now, 0.45, 0.14)
    scheduleTone(523.25, now + 0.2, 0.55, 0.12)
    return
  }

  scheduleTone(kind === 'start' ? 440 : 528, now, 0.38, 0.16)
}

export function triggerHaptic(kind: CueKind) {
  const vibrationNavigator = navigator as VibrationNavigator
  if (!vibrationNavigator.vibrate) return
  vibrationNavigator.vibrate(kind === 'complete' ? [40, 70, 40] : 30)
}
