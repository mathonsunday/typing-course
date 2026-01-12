/**
 * Analytics utilities for tracking typing accuracy
 */

import type { CharacterStats, TypingSession } from './storage'

export interface SessionAnalytics {
  characterAccuracy: Record<string, CharacterStats>
  bigramAccuracy: Record<string, CharacterStats>
  totalCharacters: number
  correctCharacters: number
  accuracy: number
  wpm: number
}

/**
 * Calculate accuracy percentage from stats
 */
export function calculateAccuracy(stats: CharacterStats): number {
  if (stats.total === 0) return 0
  return (stats.correct / stats.total) * 100
}

/**
 * Get weakest characters sorted by accuracy (lowest first)
 */
export function getWeakestCharacters(
  characterAccuracy: Record<string, CharacterStats>,
  limit: number = 10
): Array<{ char: string; accuracy: number; total: number }> {
  return Object.entries(characterAccuracy)
    .filter(([_, stats]) => stats.total >= 5) // Minimum sample size
    .map(([char, stats]) => ({
      char,
      accuracy: calculateAccuracy(stats),
      total: stats.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
}

/**
 * Get weakest bigrams sorted by accuracy (lowest first)
 */
export function getWeakestBigrams(
  bigramAccuracy: Record<string, CharacterStats>,
  limit: number = 10
): Array<{ bigram: string; accuracy: number; total: number }> {
  return Object.entries(bigramAccuracy)
    .filter(([_, stats]) => stats.total >= 3) // Minimum sample size
    .map(([bigram, stats]) => ({
      bigram,
      accuracy: calculateAccuracy(stats),
      total: stats.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
}

/**
 * Calculate WPM from characters typed and duration
 * Standard: 5 characters = 1 word
 */
export function calculateWPM(characters: number, durationMs: number): number {
  if (durationMs === 0) return 0
  const minutes = durationMs / 60000
  const words = characters / 5
  return Math.round(words / minutes)
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Track a keystroke and update analytics in place
 */
export function trackKeystroke(
  expected: string,
  actual: string,
  prevChar: string | null,
  characterAccuracy: Record<string, CharacterStats>,
  bigramAccuracy: Record<string, CharacterStats>
): boolean {
  const isCorrect = expected === actual
  
  // Update character accuracy
  if (!characterAccuracy[expected]) {
    characterAccuracy[expected] = { correct: 0, total: 0 }
  }
  characterAccuracy[expected].total++
  if (isCorrect) {
    characterAccuracy[expected].correct++
  }
  
  // Update bigram accuracy (if we have a previous character)
  if (prevChar !== null) {
    const bigram = prevChar + expected
    if (!bigramAccuracy[bigram]) {
      bigramAccuracy[bigram] = { correct: 0, total: 0 }
    }
    bigramAccuracy[bigram].total++
    if (isCorrect) {
      bigramAccuracy[bigram].correct++
    }
  }
  
  return isCorrect
}

/**
 * Create a TypingSession object from session data
 */
export function createSession(
  textContent: string,
  totalCharacters: number,
  correctCharacters: number,
  durationMs: number,
  characterAccuracy: Record<string, CharacterStats>,
  bigramAccuracy: Record<string, CharacterStats>
): TypingSession {
  return {
    id: generateSessionId(),
    timestamp: Date.now(),
    textContent,
    totalCharacters,
    correctCharacters,
    durationMs,
    wpm: calculateWPM(correctCharacters, durationMs),
    accuracy: totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0,
    characterAccuracy,
    bigramAccuracy,
  }
}
