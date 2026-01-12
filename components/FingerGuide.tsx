'use client'

import HandDiagram from './HandDiagram'

// Finger-to-key mapping for standard QWERTY touch typing
// Each finger is assigned a color for visual distinction
const FINGER_COLORS = {
  leftPinky: '#ef4444',    // red
  leftRing: '#f97316',     // orange
  leftMiddle: '#eab308',   // yellow
  leftIndex: '#22c55e',    // green
  rightIndex: '#22c55e',   // green
  rightMiddle: '#eab308',  // yellow
  rightRing: '#f97316',    // orange
  rightPinky: '#ef4444',   // red
  thumb: '#6366f1',        // purple (space bar)
}

export type FingerGuideMode = 'hands' | 'text' | 'keyboard'

// Map finger names to hand/finger index for HandDiagram
// Finger indices: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
const FINGER_TO_HAND_INDEX: Record<keyof typeof FINGER_COLORS, { hand: 'left' | 'right'; finger: number }> = {
  leftPinky: { hand: 'left', finger: 4 },
  leftRing: { hand: 'left', finger: 3 },
  leftMiddle: { hand: 'left', finger: 2 },
  leftIndex: { hand: 'left', finger: 1 },
  rightIndex: { hand: 'right', finger: 1 },
  rightMiddle: { hand: 'right', finger: 2 },
  rightRing: { hand: 'right', finger: 3 },
  rightPinky: { hand: 'right', finger: 4 },
  thumb: { hand: 'right', finger: 0 }, // Either thumb works for space
}

// Map each key to its correct finger
const KEY_TO_FINGER: Record<string, keyof typeof FINGER_COLORS> = {
  // Left pinky
  '`': 'leftPinky', '1': 'leftPinky', 'q': 'leftPinky', 'a': 'leftPinky', 'z': 'leftPinky',
  '~': 'leftPinky', '!': 'leftPinky', 'Q': 'leftPinky', 'A': 'leftPinky', 'Z': 'leftPinky',
  
  // Left ring
  '2': 'leftRing', 'w': 'leftRing', 's': 'leftRing', 'x': 'leftRing',
  '@': 'leftRing', 'W': 'leftRing', 'S': 'leftRing', 'X': 'leftRing',
  
  // Left middle
  '3': 'leftMiddle', 'e': 'leftMiddle', 'd': 'leftMiddle', 'c': 'leftMiddle',
  '#': 'leftMiddle', 'E': 'leftMiddle', 'D': 'leftMiddle', 'C': 'leftMiddle',
  
  // Left index (includes reach keys)
  '4': 'leftIndex', '5': 'leftIndex', 'r': 'leftIndex', 't': 'leftIndex',
  'f': 'leftIndex', 'g': 'leftIndex', 'v': 'leftIndex', 'b': 'leftIndex',
  '$': 'leftIndex', '%': 'leftIndex', 'R': 'leftIndex', 'T': 'leftIndex',
  'F': 'leftIndex', 'G': 'leftIndex', 'V': 'leftIndex', 'B': 'leftIndex',
  
  // Right index (includes reach keys)
  '6': 'rightIndex', '7': 'rightIndex', 'y': 'rightIndex', 'u': 'rightIndex',
  'h': 'rightIndex', 'j': 'rightIndex', 'n': 'rightIndex', 'm': 'rightIndex',
  '^': 'rightIndex', '&': 'rightIndex', 'Y': 'rightIndex', 'U': 'rightIndex',
  'H': 'rightIndex', 'J': 'rightIndex', 'N': 'rightIndex', 'M': 'rightIndex',
  
  // Right middle
  '8': 'rightMiddle', 'i': 'rightMiddle', 'k': 'rightMiddle', ',': 'rightMiddle',
  '*': 'rightMiddle', 'I': 'rightMiddle', 'K': 'rightMiddle', '<': 'rightMiddle',
  
  // Right ring
  '9': 'rightRing', 'o': 'rightRing', 'l': 'rightRing', '.': 'rightRing',
  '(': 'rightRing', 'O': 'rightRing', 'L': 'rightRing', '>': 'rightRing',
  
  // Right pinky
  '0': 'rightPinky', '-': 'rightPinky', '=': 'rightPinky', 'p': 'rightPinky',
  '[': 'rightPinky', ']': 'rightPinky', '\\': 'rightPinky', ';': 'rightPinky',
  "'": 'rightPinky', '/': 'rightPinky',
  ')': 'rightPinky', '_': 'rightPinky', '+': 'rightPinky', 'P': 'rightPinky',
  '{': 'rightPinky', '}': 'rightPinky', '|': 'rightPinky', ':': 'rightPinky',
  '"': 'rightPinky', '?': 'rightPinky',
  
  // Thumbs (space)
  ' ': 'thumb',
}

// Keyboard layout for visual display
const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
]

interface FingerGuideProps {
  currentChar?: string
  mode?: FingerGuideMode
  showInline?: boolean // For the compact stats bar display
}

// Get finger name for display
const getFingerName = (finger: keyof typeof FINGER_COLORS): string => {
  const names: Record<keyof typeof FINGER_COLORS, string> = {
    leftPinky: 'Left Pinky',
    leftRing: 'Left Ring',
    leftMiddle: 'Left Middle',
    leftIndex: 'Left Index',
    rightIndex: 'Right Index',
    rightMiddle: 'Right Middle',
    rightRing: 'Right Ring',
    rightPinky: 'Right Pinky',
    thumb: 'Thumb',
  }
  return names[finger]
}

export default function FingerGuide({ currentChar, mode = 'text', showInline = false }: FingerGuideProps) {
  const currentFinger = currentChar ? KEY_TO_FINGER[currentChar] : undefined
  const fingerColor = currentFinger ? FINGER_COLORS[currentFinger] : undefined
  const handIndex = currentFinger ? FINGER_TO_HAND_INDEX[currentFinger] : undefined
  
  // Inline display for stats bar (always text-based, compact)
  if (showInline) {
    if (!currentChar) return null
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span 
          className="px-2 py-0.5 rounded font-medium text-white"
          style={{ backgroundColor: fingerColor || '#6366f1' }}
        >
          {currentFinger ? getFingerName(currentFinger) : 'Thumb'}
        </span>
      </div>
    )
  }
  
  // MODE: Text only - minimal, just shows the finger name prominently
  if (mode === 'text') {
    if (!currentChar) return null
    
    return (
      <div className="bg-surface-raised rounded-xl p-6 border border-zinc-800">
        <div className="text-center">
          <div className="text-zinc-500 text-sm mb-2">Use your</div>
          <div 
            className="text-3xl font-semibold mb-2"
            style={{ color: fingerColor || '#6366f1' }}
          >
            {currentFinger ? getFingerName(currentFinger) : 'Thumb'}
          </div>
          <div className="text-zinc-500 text-sm">
            to type <span className="font-mono text-zinc-300 bg-surface px-2 py-1 rounded ml-1">
              {currentChar === ' ' ? '␣' : currentChar}
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  // MODE: Hands - show hand diagrams with highlighted finger
  if (mode === 'hands') {
    return (
      <div className="bg-surface-raised rounded-xl p-4 border border-zinc-800">
        <HandDiagram 
          activeHand={handIndex?.hand || null}
          activeFinger={handIndex?.finger ?? null}
        />
      </div>
    )
  }
  
  // MODE: Keyboard - color-coded keyboard visualization
  if (mode === 'keyboard') {
    return (
      <div className="bg-surface-raised rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Finger Placement Guide</h3>
        <div className="space-y-1">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center" style={{ paddingLeft: `${rowIndex * 12}px` }}>
              {row.map((key) => {
                const finger = KEY_TO_FINGER[key]
                const color = finger ? FINGER_COLORS[finger] : '#374151'
                const isCurrentKey = currentChar?.toLowerCase() === key.toLowerCase()
                
                return (
                  <div
                    key={key}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono transition-all ${
                      isCurrentKey ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ 
                      backgroundColor: color,
                      opacity: isCurrentKey ? 1 : 0.6 
                    }}
                  >
                    {key.toUpperCase()}
                  </div>
                )
              })}
            </div>
          ))}
          {/* Space bar */}
          <div className="flex justify-center pt-1">
            <div
              className={`w-48 h-8 rounded flex items-center justify-center text-xs font-mono transition-all ${
                currentChar === ' ' ? 'ring-2 ring-white scale-105' : ''
              }`}
              style={{ 
                backgroundColor: FINGER_COLORS.thumb,
                opacity: currentChar === ' ' ? 1 : 0.6 
              }}
            >
              SPACE
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: FINGER_COLORS.leftPinky }} />
            <span className="text-zinc-500">Pinky</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: FINGER_COLORS.leftRing }} />
            <span className="text-zinc-500">Ring</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: FINGER_COLORS.leftMiddle }} />
            <span className="text-zinc-500">Middle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: FINGER_COLORS.leftIndex }} />
            <span className="text-zinc-500">Index</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: FINGER_COLORS.thumb }} />
            <span className="text-zinc-500">Thumb</span>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

// Export the mapping for use in other components
export { KEY_TO_FINGER, FINGER_COLORS }
