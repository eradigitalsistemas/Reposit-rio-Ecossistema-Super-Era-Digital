let audioCtx: AudioContext | null = null

function initAudio() {
  if (audioCtx) return
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return
  audioCtx = new AudioContextClass()
}

function unlockAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  } else if (!audioCtx) {
    initAudio()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', unlockAudio, { once: true })
  window.addEventListener('keydown', unlockAudio, { once: true })
  window.addEventListener('touchstart', unlockAudio, { once: true })
}

export function playNotificationSound() {
  try {
    if (!audioCtx) initAudio()
    if (!audioCtx) return

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    // Quick notification blip sound: A5 to A6
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.3)
  } catch (e) {
    // Silently handle any browser autoplay blocking or audio api absence
  }
}
