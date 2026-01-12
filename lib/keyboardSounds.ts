/**
 * Mechanical keyboard sound profiles
 * Each profile simulates a different keyboard switch/type
 */

export type KeyboardSoundProfile = 
  | 'mxBrown'    // Soft tactile - Cherry MX Brown style
  | 'mxBlue'     // Clicky - Cherry MX Blue style  
  | 'thocky'     // Deep, bassy thock
  | 'typewriter' // Classic mechanical typewriter
  | 'bubble'     // Soft, playful pop
  | 'minimal'    // Original subtle click
  | 'none'       // Silent

export const SOUND_PROFILES: { id: KeyboardSoundProfile; name: string; description: string }[] = [
  { id: 'mxBrown', name: 'MX Brown', description: 'Soft tactile bump' },
  { id: 'mxBlue', name: 'MX Blue', description: 'Satisfying click' },
  { id: 'thocky', name: 'Thocky', description: 'Deep, bassy thock' },
  { id: 'typewriter', name: 'Typewriter', description: 'Classic mechanical' },
  { id: 'bubble', name: 'Bubble', description: 'Soft, playful pop' },
  { id: 'minimal', name: 'Minimal', description: 'Subtle and quiet' },
  { id: 'none', name: 'Silent', description: 'No sound' },
]

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export async function ensureAudioReady(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

/**
 * Play keystroke sound based on profile
 */
export function playKeystroke(profile: KeyboardSoundProfile, volume: number = 0.3): void {
  if (profile === 'none' || volume === 0) return
  
  try {
    switch (profile) {
      case 'mxBrown':
        playMXBrown(volume)
        break
      case 'mxBlue':
        playMXBlue(volume)
        break
      case 'thocky':
        playThocky(volume)
        break
      case 'typewriter':
        playTypewriter(volume)
        break
      case 'bubble':
        playBubble(volume)
        break
      case 'minimal':
      default:
        playMinimal(volume)
        break
    }
  } catch (e) {
    console.debug('Audio playback failed:', e)
  }
}

/**
 * Play error sound (consistent across profiles, but styled to match)
 */
export function playError(profile: KeyboardSoundProfile, volume: number = 0.3): void {
  if (profile === 'none' || volume === 0) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15)
    
    gain.gain.setValueAtTime(volume * 0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.15)
  } catch (e) {
    console.debug('Audio playback failed:', e)
  }
}

/**
 * Play completion sound
 */
export function playCompletion(volume: number = 0.3): void {
  if (volume === 0) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.value = freq
      
      const startTime = now + i * 0.1
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })
  } catch (e) {
    console.debug('Audio playback failed:', e)
  }
}

// ============ Sound Profile Implementations ============

function playMXBrown(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Soft bump sound - tactile but not clicky
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(400, now)
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.04)
  
  filter.type = 'lowpass'
  filter.frequency.value = 800
  
  gain.gain.setValueAtTime(volume * 0.5, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + 0.06)
  
  // Add subtle noise layer
  addNoiseLayer(ctx, now, volume * 0.2, 0.03, 1500)
}

function playMXBlue(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Sharp click sound - two-stage: bump then click
  // First: the bump
  const bump = ctx.createOscillator()
  const bumpGain = ctx.createGain()
  
  bump.type = 'sine'
  bump.frequency.setValueAtTime(600, now)
  bump.frequency.exponentialRampToValueAtTime(200, now + 0.02)
  
  bumpGain.gain.setValueAtTime(volume * 0.4, now)
  bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)
  
  bump.connect(bumpGain)
  bumpGain.connect(ctx.destination)
  
  bump.start(now)
  bump.stop(now + 0.025)
  
  // Second: the click (slightly delayed)
  const click = ctx.createOscillator()
  const clickGain = ctx.createGain()
  
  click.type = 'square'
  click.frequency.setValueAtTime(4000, now + 0.015)
  click.frequency.exponentialRampToValueAtTime(1500, now + 0.035)
  
  clickGain.gain.setValueAtTime(0, now)
  clickGain.gain.setValueAtTime(volume * 0.15, now + 0.015)
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)
  
  click.connect(clickGain)
  clickGain.connect(ctx.destination)
  
  click.start(now + 0.015)
  click.stop(now + 0.045)
  
  // Noise layer for texture
  addNoiseLayer(ctx, now, volume * 0.25, 0.04, 3000)
}

function playThocky(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Deep, bassy thock - low frequency dominant
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.08)
  
  filter.type = 'lowpass'
  filter.frequency.value = 400
  filter.Q.value = 2
  
  gain.gain.setValueAtTime(volume * 0.7, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + 0.1)
  
  // Add mid-frequency body
  const body = ctx.createOscillator()
  const bodyGain = ctx.createGain()
  
  body.type = 'triangle'
  body.frequency.setValueAtTime(300, now)
  body.frequency.exponentialRampToValueAtTime(100, now + 0.05)
  
  bodyGain.gain.setValueAtTime(volume * 0.3, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  
  body.connect(bodyGain)
  bodyGain.connect(ctx.destination)
  
  body.start(now)
  body.stop(now + 0.06)
  
  // Deep noise thump
  addNoiseLayer(ctx, now, volume * 0.3, 0.05, 500)
}

function playTypewriter(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Classic typewriter: sharp metallic strike + mechanical resonance
  // Strike
  const strike = ctx.createOscillator()
  const strikeGain = ctx.createGain()
  
  strike.type = 'sawtooth'
  strike.frequency.setValueAtTime(2000, now)
  strike.frequency.exponentialRampToValueAtTime(400, now + 0.015)
  
  strikeGain.gain.setValueAtTime(volume * 0.3, now)
  strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
  
  strike.connect(strikeGain)
  strikeGain.connect(ctx.destination)
  
  strike.start(now)
  strike.stop(now + 0.02)
  
  // Mechanical clunk
  const clunk = ctx.createOscillator()
  const clunkGain = ctx.createGain()
  const clunkFilter = ctx.createBiquadFilter()
  
  clunk.type = 'square'
  clunk.frequency.setValueAtTime(180, now + 0.01)
  clunk.frequency.exponentialRampToValueAtTime(80, now + 0.06)
  
  clunkFilter.type = 'bandpass'
  clunkFilter.frequency.value = 200
  clunkFilter.Q.value = 3
  
  clunkGain.gain.setValueAtTime(0, now)
  clunkGain.gain.setValueAtTime(volume * 0.4, now + 0.01)
  clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  
  clunk.connect(clunkFilter)
  clunkFilter.connect(clunkGain)
  clunkGain.connect(ctx.destination)
  
  clunk.start(now + 0.01)
  clunk.stop(now + 0.08)
  
  // Metallic ring
  addNoiseLayer(ctx, now, volume * 0.2, 0.03, 4000)
}

function playBubble(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Soft, playful pop sound
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.08)
  
  gain.gain.setValueAtTime(volume * 0.4, now)
  gain.gain.setValueAtTime(volume * 0.35, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + 0.1)
  
  // Soft overtone
  const overtone = ctx.createOscillator()
  const overtoneGain = ctx.createGain()
  
  overtone.type = 'sine'
  overtone.frequency.setValueAtTime(1200, now)
  overtone.frequency.exponentialRampToValueAtTime(600, now + 0.05)
  
  overtoneGain.gain.setValueAtTime(volume * 0.15, now)
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  
  overtone.connect(overtoneGain)
  overtoneGain.connect(ctx.destination)
  
  overtone.start(now)
  overtone.stop(now + 0.06)
}

function playMinimal(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Simple, subtle click
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04)
  
  gain.gain.setValueAtTime(volume * 0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + 0.05)
}

// Helper: Add filtered noise layer
function addNoiseLayer(
  ctx: AudioContext, 
  startTime: number, 
  volume: number, 
  duration: number,
  filterFreq: number
): void {
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = noiseBuffer.getChannelData(0)
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }
  
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer
  
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 1
  
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  
  noise.start(startTime)
  noise.stop(startTime + duration)
}
