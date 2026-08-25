// A short synthesized chime via the Web Audio API — no binary asset to
// ship/license, and it stays in sync with the app instead of a static file.
let audioContext: AudioContext | null = null

export function playMessageChime(): void {
  if (typeof window === 'undefined') return
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextCtor) return
    if (!audioContext) audioContext = new AudioContextCtor()
    // Browsers suspend AudioContext until a user gesture has occurred on
    // the page — by the time an incoming message can arrive, the user has
    // already interacted (logged in, clicked a conversation), so this
    // resume is just a safety net, not a workaround for a broken flow.
    if (audioContext.state === 'suspended') void audioContext.resume()

    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, now)
    oscillator.frequency.exponentialRampToValueAtTime(587, now + 0.14)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.3)
  } catch {
    // A notification chime is a nice-to-have — never worth surfacing an
    // error over (autoplay restrictions, no AudioContext support, etc.).
  }
}
