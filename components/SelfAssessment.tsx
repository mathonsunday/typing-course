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
    description: 'Thinking about fingers, making mistakes',
    emoji: '🌱'
  },
  { 
    level: 'improving', 
    label: 'Getting there', 
    description: 'Some parts natural, but not yet efficient',
    emoji: '📈'
  },
  { 
    level: 'comfortable', 
    label: 'Comfortable', 
    description: 'Mostly automatic, but could be faster',
    emoji: '😊'
  },
  { 
    level: 'fluid', 
    label: 'Ready for work', 
    description: 'Fast enough and automatic — no bottleneck',
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
      <h3 className="text-sm font-medium text-zinc-300 mb-1">How was that?</h3>
      <p className="text-xs text-zinc-500 mb-4">
        Was this fast and automatic enough for your work?
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
            🎉 Great! A few more sessions like this and you'll be ready to graduate.
          </p>
        </div>
      )}
    </div>
  )
}
