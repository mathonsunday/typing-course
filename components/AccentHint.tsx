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
      <div className="flex items-center gap-4">
        {/* Character being typed */}
        <div className="flex-shrink-0">
          <div className="text-4xl font-mono text-amber-200 bg-amber-900/50 w-14 h-14 rounded-lg flex items-center justify-center">
            {currentChar}
          </div>
        </div>
        
        {/* Step-by-step instructions with fingers */}
        <div className="flex-1">
          <div className="space-y-2">
            {instruction.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Step number */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-800/50 text-amber-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                
                {/* Keys */}
                <kbd className="px-2 py-1 bg-amber-900/70 border border-amber-700 rounded text-amber-100 font-mono text-sm min-w-[100px]">
                  {step.keys}
                </kbd>
                
                {/* Fingers */}
                <span className="text-amber-400/80 text-sm">
                  {step.fingers}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick tip */}
      {instruction.steps.length > 1 && (
        <div className="mt-3 pt-3 border-t border-amber-800/30 text-xs text-amber-500/80">
          💡 <strong>Tip:</strong> Use your left thumb for the Option key (bottom left of keyboard). 
          Hold it while pressing the first key, then release both before pressing the second key.
        </div>
      )}
    </div>
  )
}
