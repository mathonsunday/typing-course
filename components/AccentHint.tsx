'use client'

import { isSpanishAccent, getAccentInstruction } from '@/lib/spanishAccents'

interface AccentHintProps {
  currentChar?: string
}

export default function AccentHint({ currentChar }: AccentHintProps) {
  if (!currentChar || !isSpanishAccent(currentChar)) {
    return null
  }
  
  const instruction = getAccentInstruction(currentChar)
  if (!instruction) return null
  
  return (
    <div className="bg-amber-950/50 border border-amber-700/50 rounded-xl p-4">
      <div className="flex items-center gap-3">
        {/* Character being typed */}
        <div className="flex-shrink-0">
          <div className="text-4xl font-mono text-amber-200 bg-amber-900/50 w-14 h-14 rounded-lg flex items-center justify-center">
            {currentChar}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="flex-1">
          <div className="text-amber-400 text-xs uppercase tracking-wide mb-1">
            Mac Shortcut
          </div>
          <div className="flex items-center gap-2">
            {instruction.steps.map((step, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-amber-600">→</span>}
                <kbd className="px-2 py-1 bg-amber-900/70 border border-amber-700 rounded text-amber-100 font-mono text-sm">
                  {step}
                </kbd>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick tip for first-timers */}
      <div className="mt-3 text-xs text-amber-500/80">
        💡 Hold Option (⌥) while pressing the first key, release, then press the second key
      </div>
    </div>
  )
}
