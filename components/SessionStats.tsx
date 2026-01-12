'use client'

import { useAtom } from 'jotai'
import { sessionsAtom, aggregateCharacterAccuracyAtom } from '@/stores/progress'
import { getWeakestCharacters, calculateAccuracy } from '@/lib/analytics'

export default function SessionStats() {
  const [sessions] = useAtom(sessionsAtom)
  const [charAccuracy] = useAtom(aggregateCharacterAccuracyAtom)
  
  if (sessions.length === 0) {
    return null
  }
  
  // Calculate aggregate stats
  const totalSessions = sessions.length
  const totalCharacters = sessions.reduce((sum, s) => sum + s.totalCharacters, 0)
  const avgWPM = Math.round(
    sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSessions
  )
  const avgAccuracy = (
    sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions
  ).toFixed(1)
  
  // Get weakest characters
  const weakestChars = getWeakestCharacters(charAccuracy, 5)
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h2 className="text-lg font-medium text-zinc-100 mb-4">Your Progress</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-semibold text-zinc-100">{totalSessions}</div>
          <div className="text-xs text-zinc-500">Sessions</div>
        </div>
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-semibold text-zinc-100">
            {totalCharacters.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">Characters typed</div>
        </div>
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-semibold text-zinc-100">{avgWPM}</div>
          <div className="text-xs text-zinc-500">Avg WPM</div>
        </div>
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-semibold text-zinc-100">{avgAccuracy}%</div>
          <div className="text-xs text-zinc-500">Avg Accuracy</div>
        </div>
      </div>
      
      {/* Weakest characters */}
      {weakestChars.length > 0 && (
        <div className="bg-surface-raised rounded-lg p-4 border border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Characters to focus on
          </h3>
          <div className="flex items-center gap-3">
            {weakestChars.map(({ char, accuracy }) => (
              <div
                key={char}
                className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg"
              >
                <span className="text-lg font-mono text-zinc-100">
                  {char === ' ' ? '␣' : char}
                </span>
                <span className={`text-xs ${
                  accuracy < 80 ? 'text-error' : accuracy < 90 ? 'text-yellow-500' : 'text-zinc-500'
                }`}>
                  {accuracy.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
