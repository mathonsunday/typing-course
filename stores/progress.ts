'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { UserProgress, UserSettings, TypingSession, DailyProgress } from '@/lib/storage'

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

// Default values
const DEFAULT_SETTINGS: UserSettings = {
  showFingerGuide: true,
  darkMode: true,
  adaptiveModeEnabled: false,
  soundEnabled: true,
  soundVolume: 0.5,
  ambianceStyle: 'nebula',
  ambianceIntensity: 0.5,
  customTextLibrary: [],
}

const DEFAULT_PROGRESS: UserProgress = {
  sessions: [],
  aggregateCharacterAccuracy: {},
  aggregateBigramAccuracy: {},
  settings: DEFAULT_SETTINGS,
  dailyGoalMinutes: 5,
  dailyProgress: {
    date: getTodayDateString(),
    totalTimeMs: 0,
  },
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

export const dailyGoalMinutesAtom = atom(
  (get) => get(progressAtom).dailyGoalMinutes || 5,
  (get, set, newGoal: number) => {
    const progress = get(progressAtom)
    set(progressAtom, {
      ...progress,
      dailyGoalMinutes: newGoal,
    })
  }
)

// Get daily progress, reset if it's a new day
export const dailyProgressAtom = atom(
  (get) => {
    const progress = get(progressAtom)
    const today = getTodayDateString()
    
    // If no daily progress or it's from a different day, return zero
    if (!progress.dailyProgress || progress.dailyProgress.date !== today) {
      return { date: today, totalTimeMs: 0 }
    }
    
    return progress.dailyProgress
  }
)

// Action atom to save a session
export const saveSessionAtom = atom(
  null,
  (get, set, session: TypingSession) => {
    const progress = get(progressAtom)
    const today = getTodayDateString()
    
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
    
    // Update daily progress
    let dailyProgress = progress.dailyProgress || { date: today, totalTimeMs: 0 }
    if (dailyProgress.date !== today) {
      // New day, reset
      dailyProgress = { date: today, totalTimeMs: 0 }
    }
    dailyProgress = {
      date: today,
      totalTimeMs: dailyProgress.totalTimeMs + session.durationMs,
    }
    
    set(progressAtom, {
      ...progress,
      sessions: newSessions,
      aggregateCharacterAccuracy: newCharAccuracy,
      aggregateBigramAccuracy: newBigramAccuracy,
      dailyProgress,
    })
  }
)
