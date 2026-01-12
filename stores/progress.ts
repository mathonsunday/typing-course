'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { UserProgress, UserSettings, TypingSession } from '@/lib/storage'

// Default values
const DEFAULT_SETTINGS: UserSettings = {
  showFingerGuide: true,
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

// Main progress atom with localStorage persistence
export const progressAtom = atomWithStorage<UserProgress>(
  'typing-course-progress',
  DEFAULT_PROGRESS
)

// Derived atoms for convenience
export const settingsAtom = atom(
  (get) => get(progressAtom).settings,
  (get, set, newSettings: Partial<UserSettings>) => {
    const progress = get(progressAtom)
    set(progressAtom, {
      ...progress,
      settings: { ...progress.settings, ...newSettings },
    })
  }
)

export const sessionsAtom = atom((get) => get(progressAtom).sessions)

export const aggregateCharacterAccuracyAtom = atom(
  (get) => get(progressAtom).aggregateCharacterAccuracy
)

export const aggregateBigramAccuracyAtom = atom(
  (get) => get(progressAtom).aggregateBigramAccuracy
)

// Action atom to save a session
export const saveSessionAtom = atom(
  null,
  (get, set, session: TypingSession) => {
    const progress = get(progressAtom)
    
    // Add session
    const newSessions = [...progress.sessions, session]
    
    // Update aggregate character accuracy
    const newCharAccuracy = { ...progress.aggregateCharacterAccuracy }
    for (const [char, stats] of Object.entries(session.characterAccuracy)) {
      if (!newCharAccuracy[char]) {
        newCharAccuracy[char] = { correct: 0, total: 0 }
      }
      newCharAccuracy[char] = {
        correct: newCharAccuracy[char].correct + stats.correct,
        total: newCharAccuracy[char].total + stats.total,
      }
    }
    
    // Update aggregate bigram accuracy
    const newBigramAccuracy = { ...progress.aggregateBigramAccuracy }
    for (const [bigram, stats] of Object.entries(session.bigramAccuracy)) {
      if (!newBigramAccuracy[bigram]) {
        newBigramAccuracy[bigram] = { correct: 0, total: 0 }
      }
      newBigramAccuracy[bigram] = {
        correct: newBigramAccuracy[bigram].correct + stats.correct,
        total: newBigramAccuracy[bigram].total + stats.total,
      }
    }
    
    set(progressAtom, {
      ...progress,
      sessions: newSessions,
      aggregateCharacterAccuracy: newCharAccuracy,
      aggregateBigramAccuracy: newBigramAccuracy,
    })
  }
)
