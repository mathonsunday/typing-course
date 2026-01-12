'use client'

import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { sessionsAtom } from '@/stores/progress'

const RECENT_WINDOW = 5

interface Improvement {
  type: 'wpm' | 'accuracy' | 'streak' | 'milestone' | 'character'
  message: string
  emoji: string
}

export default function Encouragement() {
  const sessions = useAtomValue(sessionsAtom)
  
  const improvements = useMemo(() => {
    const results: Improvement[] = []
    
    if (sessions.length === 0) return results
    
    const recentSessions = sessions.slice(-RECENT_WINDOW)
    const lastSession = sessions[sessions.length - 1]
    
    // Check for WPM improvement
    if (sessions.length > RECENT_WINDOW) {
      const olderSessions = sessions.slice(-RECENT_WINDOW * 2, -RECENT_WINDOW)
      if (olderSessions.length > 0) {
        const recentAvgWPM = recentSessions.reduce((s, x) => s + x.wpm, 0) / recentSessions.length
        const olderAvgWPM = olderSessions.reduce((s, x) => s + x.wpm, 0) / olderSessions.length
        
        if (recentAvgWPM >= olderAvgWPM + 3) {
          results.push({
            type: 'wpm',
            message: `Your speed is up ${Math.round(recentAvgWPM - olderAvgWPM)} WPM recently!`,
            emoji: '🚀',
          })
        }
      }
    }
    
    // Check for personal best WPM
    if (sessions.length >= 3) {
      const allWPMs = sessions.map(s => s.wpm)
      const maxWPM = Math.max(...allWPMs)
      if (lastSession.wpm === maxWPM && lastSession.wpm > 0) {
        results.push({
          type: 'wpm',
          message: `New personal best: ${maxWPM} WPM!`,
          emoji: '🏆',
        })
      }
    }
    
    // Milestone celebrations
    const milestones = [5, 10, 25, 50, 100]
    const reachedMilestone = milestones.find(m => sessions.length === m)
    if (reachedMilestone) {
      results.push({
        type: 'milestone',
        message: `${reachedMilestone} sessions completed!`,
        emoji: '🎉',
      })
    }
    
    // Consistent practice streak (sessions in recent days)
    const assessedRecent = recentSessions.filter(s => s.selfAssessment)
    if (assessedRecent.length >= 3) {
      const comfortableCount = assessedRecent.filter(
        s => s.selfAssessment === 'comfortable' || s.selfAssessment === 'ready_for_work'
      ).length
      if (comfortableCount >= 3) {
        results.push({
          type: 'streak',
          message: `Feeling confident! ${comfortableCount} comfortable sessions recently.`,
          emoji: '💪',
        })
      }
    }
    
    // First session encouragement
    if (sessions.length === 1) {
      results.push({
        type: 'milestone',
        message: "Great start! The first session is always the hardest.",
        emoji: '🌟',
      })
    }
    
    return results.slice(0, 2) // Show max 2 encouragements
  }, [sessions])
  
  if (improvements.length === 0) return null
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-gradient-to-r from-green-950/30 to-emerald-950/20 rounded-xl p-4 border border-green-900/30">
        <div className="space-y-2">
          {improvements.map((imp, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{imp.emoji}</span>
              <span className="text-sm text-green-300">{imp.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
