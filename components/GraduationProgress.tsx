'use client'

import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { progressAtom } from '@/stores/progress'
import { getGraduationStatus, GRADUATION_THRESHOLD, GRADUATION_WINDOW } from '@/lib/storage'

interface GraduationProgressProps {
  variant?: 'full' | 'compact'
}

export default function GraduationProgress({ variant = 'full' }: GraduationProgressProps) {
  const progress = useAtomValue(progressAtom)
  
  const status = useMemo(() => getGraduationStatus(progress), [progress])
  
  // Don't show if user hasn't done any sessions yet
  if (status.windowSize === 0) {
    return null
  }
  
  // Graduated state
  if (status.isGraduated) {
    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <span>🎓</span>
          <span className="text-sm font-medium">Graduated!</span>
        </div>
      )
    }
    
    return (
      <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <h2 className="text-xl font-semibold text-green-300 mb-2">
          You've Graduated!
        </h2>
        <p className="text-green-400/80 text-sm mb-4">
          You've consistently felt "Ready for work" — your touch typing is solid.
        </p>
        <p className="text-zinc-500 text-xs">
          Keep practicing to stay sharp, or just use this skill in your daily work!
        </p>
      </div>
    )
  }
  
  // Progress toward graduation
  const progressPercent = Math.min(100, (status.readyCount / GRADUATION_THRESHOLD) * 100)
  const remaining = GRADUATION_THRESHOLD - status.readyCount
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-zinc-500 text-sm">Graduation:</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: GRADUATION_WINDOW }).map((_, i) => {
            // Show filled dots for "ready" sessions, empty for others
            const sessionIndex = status.windowSize - GRADUATION_WINDOW + i
            const session = progress.sessions.filter(s => s.selfAssessment)[sessionIndex]
            const isReady = session?.selfAssessment === 'ready_for_work'
            const isEmpty = sessionIndex < 0 || !session
            
            return (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  isEmpty
                    ? 'bg-zinc-800 border border-zinc-700'
                    : isReady
                      ? 'bg-green-500'
                      : 'bg-zinc-600'
                }`}
                title={isEmpty ? 'No session yet' : isReady ? 'Ready for work' : 'Still practicing'}
              />
            )
          })}
        </div>
        <span className="text-zinc-400 text-xs">
          {status.readyCount}/{GRADUATION_THRESHOLD}
        </span>
      </div>
    )
  }
  
  // Full variant
  return (
    <div className="bg-surface-raised border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-zinc-200">Path to Graduation</h3>
        <span className="text-sm text-zinc-500">
          {status.readyCount} of {GRADUATION_THRESHOLD} sessions
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Session dots */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: GRADUATION_WINDOW }).map((_, i) => {
          const assessedSessions = progress.sessions.filter(s => s.selfAssessment)
          const sessionIndex = assessedSessions.length - GRADUATION_WINDOW + i
          const session = assessedSessions[sessionIndex]
          const isReady = session?.selfAssessment === 'ready_for_work'
          const isEmpty = sessionIndex < 0 || !session
          
          return (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                isEmpty
                  ? 'bg-zinc-800 border-2 border-zinc-700'
                  : isReady
                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                    : 'bg-zinc-600'
              }`}
              title={
                isEmpty 
                  ? 'Complete a session' 
                  : isReady 
                    ? '✓ Ready for work' 
                    : 'Still practicing'
              }
            />
          )
        })}
      </div>
      
      {/* Status message */}
      <p className="text-center text-sm text-zinc-400">
        {remaining > 0 ? (
          <>
            {remaining} more "Ready for work" session{remaining > 1 ? 's' : ''} to graduate
          </>
        ) : (
          <span className="text-green-400">Almost there! Keep it up!</span>
        )}
      </p>
      
      {/* Explanation */}
      <p className="text-center text-xs text-zinc-600 mt-3">
        Graduate by feeling "Ready for work" in {GRADUATION_THRESHOLD} of your last {GRADUATION_WINDOW} sessions
      </p>
    </div>
  )
}
