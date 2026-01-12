'use client'

import { useState } from 'react'

export type ConfidenceLevel = 'struggling' | 'improving' | 'comfortable' | 'fluid'

interface SelfAssessmentProps {
  wpm: number
  onAssessment: (confidence: ConfidenceLevel) => void
}

const CONFIDENCE_OPTIONS: { level: ConfidenceLevel; label: string; description: string; emoji: string }[] = [
  { 
    level: 'struggling', 
    label: 'Still learning', 
    description: 'Having to think about finger placement',
    emoji: '🌱'
  },
  { 
    level: 'improving', 
    label: 'Getting there', 
    description: 'Some keys feel natural, others need work',
    emoji: '📈'
  },
  { 
    level: 'comfortable', 
    label: 'Comfortable', 
    description: 'Typing feels mostly automatic',
    emoji: '😊'
  },
  { 
    level: 'fluid', 
    label: 'Fluid & confident', 
    description: 'Not thinking about typing at all',
    emoji: '✨'
  },
]

export default function SelfAssessment({ wpm, onAssessment }: SelfAssessmentProps) {
  const [selected, setSelected] = useState<ConfidenceLevel | null>(null)
  
  const handleSelect = (level: ConfidenceLevel) => {
    setSelected(level)
    onAssessment(level)
  }
  
  return (
    <div className="bg-surface-raised rounded-xl p-5 border border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-300 mb-1">How did that feel?</h3>
      <p className="text-xs text-zinc-500 mb-4">
        At {wpm} WPM, your typing felt...
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {CONFIDENCE_OPTIONS.map((option) => (
          <button
            key={option.level}
            onClick={() => handleSelect(option.level)}
            className={`p-3 rounded-lg text-left transition-all ${
              selected === option.level
                ? 'bg-accent/20 border-accent border'
                : 'bg-surface border border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{option.emoji}</span>
              <span className={`text-sm font-medium ${
                selected === option.level ? 'text-accent' : 'text-zinc-200'
              }`}>
                {option.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500">{option.description}</p>
          </button>
        ))}
      </div>
      
      {selected === 'fluid' && (
        <div className="mt-4 p-3 bg-green-950/30 border border-green-800/30 rounded-lg">
          <p className="text-sm text-green-400">
            🎉 Amazing! If you consistently feel fluid at this speed, you might be ready to graduate!
          </p>
        </div>
      )}
    </div>
  )
}
