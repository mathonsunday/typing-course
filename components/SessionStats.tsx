'use client'

import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { sessionsAtom } from '@/stores/progress'

const RECENT_WINDOW = 5

export default function SessionStats() {
  const [sessions] = useAtom(sessionsAtom)
  
  // Calculate stats with recent weighting
  const stats = useMemo(() => {
    if (sessions.length === 0) return null
    
    const totalSessions = sessions.length
    const totalCharacters = sessions.reduce((sum, s) => sum + s.totalCharacters, 0)
    
    // Recent sessions (last 5)
    const recentSessions = sessions.slice(-RECENT_WINDOW)
    const recentWPM = Math.round(
      recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length
    )
    const recentAccuracy = (
      recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
    )
    
    // Older sessions for comparison (if we have enough history)
    let wpmTrend: 'up' | 'down' | 'same' | null = null
    let accuracyTrend: 'up' | 'down' | 'same' | null = null
    let wpmChange = 0
    let accuracyChange = 0
    
    if (sessions.length > RECENT_WINDOW) {
      const olderSessions = sessions.slice(0, -RECENT_WINDOW).slice(-RECENT_WINDOW)
      if (olderSessions.length > 0) {
        const olderWPM = olderSessions.reduce((sum, s) => sum + s.wpm, 0) / olderSessions.length
        const olderAccuracy = olderSessions.reduce((sum, s) => sum + s.accuracy, 0) / olderSessions.length
        
        wpmChange = recentWPM - olderWPM
        accuracyChange = recentAccuracy - olderAccuracy
        
        if (wpmChange >= 2) wpmTrend = 'up'
        else if (wpmChange <= -2) wpmTrend = 'down'
        else wpmTrend = 'same'
        
        if (accuracyChange >= 1) accuracyTrend = 'up'
        else if (accuracyChange <= -1) accuracyTrend = 'down'
        else accuracyTrend = 'same'
      }
    }
    
    // Get weak characters from recent sessions only
    const recentCharAccuracy: Record<string, { correct: number; total: number }> = {}
    for (const session of recentSessions) {
      for (const [char, stats] of Object.entries(session.characterAccuracy)) {
        if (!recentCharAccuracy[char]) {
          recentCharAccuracy[char] = { correct: 0, total: 0 }
        }
        recentCharAccuracy[char].correct += stats.correct
        recentCharAccuracy[char].total += stats.total
      }
    }
    
    const weakestChars = Object.entries(recentCharAccuracy)
      .filter(([, stats]) => stats.total >= 3) // Need enough attempts
      .map(([char, stats]) => ({
        char,
        accuracy: (stats.correct / stats.total) * 100,
      }))
      .filter(({ accuracy }) => accuracy < 95) // Only show if under 95%
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
    
    return {
      totalSessions,
      totalCharacters,
      recentWPM,
      recentAccuracy: recentAccuracy.toFixed(1),
      wpmTrend,
      accuracyTrend,
      wpmChange: Math.abs(Math.round(wpmChange)),
      accuracyChange: Math.abs(accuracyChange).toFixed(1),
      weakestChars,
    }
  }, [sessions])
  
  if (!stats) return null
  
  const TrendIndicator = ({ trend, change, unit }: { trend: 'up' | 'down' | 'same' | null; change: number | string; unit: string }) => {
    if (!trend || trend === 'same') return null
    const isUp = trend === 'up'
    return (
      <span className={`text-xs flex items-center gap-0.5 ${isUp ? 'text-green-400' : 'text-zinc-500'}`}>
        {isUp ? '↑' : '↓'} {change}{unit}
      </span>
    )
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h2 className="text-lg font-medium text-zinc-100 mb-4">Your Progress</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-semibold text-zinc-100">{stats.totalSessions}</div>
          <div className="text-xs text-zinc-500">Sessions</div>
        </div>
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-semibold text-zinc-100">
            {stats.totalCharacters.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">Characters typed</div>
        </div>
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-zinc-100">{stats.recentWPM}</span>
            <TrendIndicator trend={stats.wpmTrend} change={stats.wpmChange} unit="" />
          </div>
          <div className="text-xs text-zinc-500">Recent WPM</div>
        </div>
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-zinc-100">{stats.recentAccuracy}%</span>
            <TrendIndicator trend={stats.accuracyTrend} change={stats.accuracyChange} unit="%" />
          </div>
          <div className="text-xs text-zinc-500">Recent Accuracy</div>
        </div>
      </div>
      
      {/* Weakest characters - only show if there are struggles */}
      {stats.weakestChars.length > 0 && (
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Characters to practice
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            {stats.weakestChars.map(({ char, accuracy }) => (
              <div
                key={char}
                className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg"
              >
                <span className="text-lg font-mono text-zinc-100">
                  {char === ' ' ? '␣' : char}
                </span>
                <span className={`text-xs ${
                  accuracy < 80 ? 'text-amber-400' : 'text-zinc-500'
                }`}>
                  {accuracy.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Encouragement when no problem characters */}
      {stats.weakestChars.length === 0 && stats.totalSessions >= 3 && (
        <div className="bg-green-950/20 rounded-lg p-4 border border-green-900/30">
          <p className="text-sm text-green-400">
            ✨ All characters looking good! Keep up the consistent practice.
          </p>
        </div>
      )}
    </div>
  )
}
