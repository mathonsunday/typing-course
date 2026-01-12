/**
 * localStorage persistence for typing sessions and user progress
 */

export interface CharacterStats {
  correct: number
  total: number
}

export interface TypingSession {
  id: string
  timestamp: number
  textContent: string
  totalCharacters: number
  correctCharacters: number
  durationMs: number
  wpm: number
  accuracy: number
  characterAccuracy: Record<string, CharacterStats>
  bigramAccuracy: Record<string, CharacterStats>
}

export interface UserSettings {
  showFingerGuide: boolean
  darkMode: boolean
  adaptiveModeEnabled: boolean
  soundEnabled: boolean
  soundVolume: number // 0-1
  customTextLibrary: string[]
}

export interface UserProgress {
  sessions: TypingSession[]
  aggregateCharacterAccuracy: Record<string, CharacterStats>
  aggregateBigramAccuracy: Record<string, CharacterStats>
  settings: UserSettings
}

const STORAGE_KEY = 'typing-course-progress'

const DEFAULT_SETTINGS: UserSettings = {
  showFingerGuide: false,
  darkMode: true,
  adaptiveModeEnabled: false,
  soundEnabled: true,
  soundVolume: 0.3,
  customTextLibrary: [],
}

const DEFAULT_PROGRESS: UserProgress = {
  sessions: [],
  aggregateCharacterAccuracy: {},
  aggregateBigramAccuracy: {},
  settings: DEFAULT_SETTINGS,
}

/**
 * Load user progress from localStorage
 */
export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_PROGRESS
    }
    
    const parsed = JSON.parse(stored)
    // Merge with defaults to handle new fields added in updates
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
      },
    }
  } catch (e) {
    console.error('Failed to load progress:', e)
    return DEFAULT_PROGRESS
  }
}

/**
 * Save user progress to localStorage
 */
export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

/**
 * Save a completed typing session
 */
export function saveSession(session: TypingSession): UserProgress {
  const progress = loadProgress()
  
  // Add session to history
  progress.sessions.push(session)
  
  // Update aggregate character accuracy
  for (const [char, stats] of Object.entries(session.characterAccuracy)) {
    if (!progress.aggregateCharacterAccuracy[char]) {
      progress.aggregateCharacterAccuracy[char] = { correct: 0, total: 0 }
    }
    progress.aggregateCharacterAccuracy[char].correct += stats.correct
    progress.aggregateCharacterAccuracy[char].total += stats.total
  }
  
  // Update aggregate bigram accuracy
  for (const [bigram, stats] of Object.entries(session.bigramAccuracy)) {
    if (!progress.aggregateBigramAccuracy[bigram]) {
      progress.aggregateBigramAccuracy[bigram] = { correct: 0, total: 0 }
    }
    progress.aggregateBigramAccuracy[bigram].correct += stats.correct
    progress.aggregateBigramAccuracy[bigram].total += stats.total
  }
  
  saveProgress(progress)
  return progress
}

/**
 * Update user settings
 */
export function saveSettings(settings: Partial<UserSettings>): UserProgress {
  const progress = loadProgress()
  progress.settings = { ...progress.settings, ...settings }
  saveProgress(progress)
  return progress
}

/**
 * Export progress as JSON for backup
 */
export function exportProgress(): string {
  const progress = loadProgress()
  return JSON.stringify(progress, null, 2)
}

/**
 * Import progress from JSON backup
 */
export function importProgress(json: string): UserProgress {
  const progress = JSON.parse(json) as UserProgress
  saveProgress(progress)
  return progress
}

/**
 * Clear all progress (with confirmation)
 */
export function clearProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
