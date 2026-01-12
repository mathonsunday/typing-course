'use client'

import { useAtom } from 'jotai'
import { dailyProgressAtom, dailyGoalMinutesAtom } from '@/stores/progress'

interface DailyGoalProps {
  variant?: 'compact' | 'full'
  currentSessionMs?: number // For live updates during typing
}

export default function DailyGoal({ variant = 'full', currentSessionMs = 0 }: DailyGoalProps) {
  const [dailyProgress] = useAtom(dailyProgressAtom)
  const [dailyGoalMinutes] = useAtom(dailyGoalMinutesAtom)
  
  const totalTimeMs = dailyProgress.totalTimeMs + currentSessionMs
  const goalMs = dailyGoalMinutes * 60 * 1000
  const progressPercent = Math.min(100, (totalTimeMs / goalMs) * 100)
  const isComplete = totalTimeMs >= goalMs
  
  // Format time display
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const formatGoal = (minutes: number): string => {
    return `${minutes}:00`
  }
  
  // Compact variant for stats bar
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${isComplete ? 'bg-correct' : 'bg-accent'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className={`text-xs ${isComplete ? 'text-correct' : 'text-zinc-400'}`}>
          {formatTime(totalTimeMs)}/{formatGoal(dailyGoalMinutes)}
        </span>
        {isComplete && <span className="text-correct text-xs">✓</span>}
      </div>
    )
  }
  
  // Full variant for home screen
  return (
    <div className={`rounded-xl p-6 border ${
      isComplete 
        ? 'bg-correct/10 border-correct/30' 
        : 'bg-surface-raised border-zinc-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-medium ${isComplete ? 'text-correct' : 'text-zinc-100'}`}>
            {isComplete ? 'Daily Goal Complete!' : 'Daily Goal'}
          </h3>
          <p className="text-sm text-zinc-500">
            {isComplete 
              ? 'Great work! Come back tomorrow.' 
              : `${dailyGoalMinutes} minutes of practice`
            }
          </p>
        </div>
        <div className={`text-3xl font-semibold ${isComplete ? 'text-correct' : 'text-zinc-100'}`}>
          {isComplete ? '✓' : `${Math.round(progressPercent)}%`}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-zinc-700 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full transition-all duration-500 ease-out ${
            isComplete ? 'bg-correct' : 'bg-accent'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Time display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          {formatTime(totalTimeMs)} practiced today
        </span>
        <span className="text-zinc-500">
          {isComplete 
            ? `+${formatTime(totalTimeMs - goalMs)} extra`
            : `${formatTime(goalMs - totalTimeMs)} remaining`
          }
        </span>
      </div>
    </div>
  )
}
