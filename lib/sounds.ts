/**
 * Sound feedback system using Web Audio API
 * Generates satisfying keystroke sounds and subtle error tones
 */

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/**
 * Play a satisfying "tick" sound for correct keystrokes
 * Uses a short, crisp click with subtle harmonics
 */
export function playKeystrokeSound(volume: number = 0.3): void {
  if (volume === 0) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Main click oscillator
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05)
    
    gain.gain.setValueAtTime(volume * 0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.05)
    
    // Add a subtle "thock" layer for mechanical feel
    const noiseGain = ctx.createGain()
    const noiseFilter = ctx.createBiquadFilter()
    const bufferSize = ctx.sampleRate * 0.02
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 2000
    noiseFilter.Q.value = 1
    
    noiseGain.gain.setValueAtTime(volume * 0.15, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
    
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    
    noise.start(now)
    noise.stop(now + 0.02)
  } catch (e) {
    // Audio not supported or blocked, fail silently
    console.debug('Audio playback failed:', e)
  }
}

/**
 * Play a subtle error tone - not harsh, just informative
 * Lower pitch, slightly longer decay
 */
export function playErrorSound(volume: number = 0.3): void {
  if (volume === 0) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1)
    
    gain.gain.setValueAtTime(volume * 0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.1)
  } catch (e) {
    console.debug('Audio playback failed:', e)
  }
}

/**
 * Play a completion sound when a session ends
 */
export function playCompletionSound(volume: number = 0.3): void {
  if (volume === 0) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Pleasant ascending arpeggio
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.value = freq
      
      const startTime = now + i * 0.08
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })
  } catch (e) {
    console.debug('Audio playback failed:', e)
  }
}

/**
 * Resume audio context if suspended (browser autoplay policy)
 */
export async function ensureAudioReady(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}
