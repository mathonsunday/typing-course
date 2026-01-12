'use client'

import HandDiagram from './HandDiagram'
import { isSpanishAccent } from '@/lib/spanishAccents'

// Finger indices: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
type ActiveFinger = { hand: 'left' | 'right'; finger: number }

// Characters that require holding shift
const SHIFTED_CHARS = new Set([
  // Uppercase letters
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Shifted punctuation
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+',
  '{', '}', '|', ':', '"', '<', '>', '?', '~',
])

// Map each key to its correct finger
const KEY_TO_FINGER: Record<string, ActiveFinger> = {
  // Left pinky
  '`': { hand: 'left', finger: 4 }, '1': { hand: 'left', finger: 4 }, 
  'q': { hand: 'left', finger: 4 }, 'a': { hand: 'left', finger: 4 }, 'z': { hand: 'left', finger: 4 },
  '~': { hand: 'left', finger: 4 }, '!': { hand: 'left', finger: 4 }, 
  'Q': { hand: 'left', finger: 4 }, 'A': { hand: 'left', finger: 4 }, 'Z': { hand: 'left', finger: 4 },
  
  // Left ring
  '2': { hand: 'left', finger: 3 }, 'w': { hand: 'left', finger: 3 }, 
  's': { hand: 'left', finger: 3 }, 'x': { hand: 'left', finger: 3 },
  '@': { hand: 'left', finger: 3 }, 'W': { hand: 'left', finger: 3 }, 
  'S': { hand: 'left', finger: 3 }, 'X': { hand: 'left', finger: 3 },
  
  // Left middle
  '3': { hand: 'left', finger: 2 }, 'e': { hand: 'left', finger: 2 }, 
  'd': { hand: 'left', finger: 2 }, 'c': { hand: 'left', finger: 2 },
  '#': { hand: 'left', finger: 2 }, 'E': { hand: 'left', finger: 2 }, 
  'D': { hand: 'left', finger: 2 }, 'C': { hand: 'left', finger: 2 },
  
  // Left index (includes reach keys)
  '4': { hand: 'left', finger: 1 }, '5': { hand: 'left', finger: 1 }, 
  'r': { hand: 'left', finger: 1 }, 't': { hand: 'left', finger: 1 },
  'f': { hand: 'left', finger: 1 }, 'g': { hand: 'left', finger: 1 }, 
  'v': { hand: 'left', finger: 1 }, 'b': { hand: 'left', finger: 1 },
  '$': { hand: 'left', finger: 1 }, '%': { hand: 'left', finger: 1 }, 
  'R': { hand: 'left', finger: 1 }, 'T': { hand: 'left', finger: 1 },
  'F': { hand: 'left', finger: 1 }, 'G': { hand: 'left', finger: 1 }, 
  'V': { hand: 'left', finger: 1 }, 'B': { hand: 'left', finger: 1 },
  
  // Right index (includes reach keys)
  '6': { hand: 'right', finger: 1 }, '7': { hand: 'right', finger: 1 }, 
  'y': { hand: 'right', finger: 1 }, 'u': { hand: 'right', finger: 1 },
  'h': { hand: 'right', finger: 1 }, 'j': { hand: 'right', finger: 1 }, 
  'n': { hand: 'right', finger: 1 }, 'm': { hand: 'right', finger: 1 },
  '^': { hand: 'right', finger: 1 }, '&': { hand: 'right', finger: 1 }, 
  'Y': { hand: 'right', finger: 1 }, 'U': { hand: 'right', finger: 1 },
  'H': { hand: 'right', finger: 1 }, 'J': { hand: 'right', finger: 1 }, 
  'N': { hand: 'right', finger: 1 }, 'M': { hand: 'right', finger: 1 },
  
  // Right middle
  '8': { hand: 'right', finger: 2 }, 'i': { hand: 'right', finger: 2 }, 
  'k': { hand: 'right', finger: 2 }, ',': { hand: 'right', finger: 2 },
  '*': { hand: 'right', finger: 2 }, 'I': { hand: 'right', finger: 2 }, 
  'K': { hand: 'right', finger: 2 }, '<': { hand: 'right', finger: 2 },
  
  // Right ring
  '9': { hand: 'right', finger: 3 }, 'o': { hand: 'right', finger: 3 }, 
  'l': { hand: 'right', finger: 3 }, '.': { hand: 'right', finger: 3 },
  '(': { hand: 'right', finger: 3 }, 'O': { hand: 'right', finger: 3 }, 
  'L': { hand: 'right', finger: 3 }, '>': { hand: 'right', finger: 3 },
  
  // Right pinky
  '0': { hand: 'right', finger: 4 }, '-': { hand: 'right', finger: 4 }, 
  '=': { hand: 'right', finger: 4 }, 'p': { hand: 'right', finger: 4 },
  '[': { hand: 'right', finger: 4 }, ']': { hand: 'right', finger: 4 }, 
  '\\': { hand: 'right', finger: 4 }, ';': { hand: 'right', finger: 4 },
  "'": { hand: 'right', finger: 4 }, '/': { hand: 'right', finger: 4 },
  ')': { hand: 'right', finger: 4 }, '_': { hand: 'right', finger: 4 }, 
  '+': { hand: 'right', finger: 4 }, 'P': { hand: 'right', finger: 4 },
  '{': { hand: 'right', finger: 4 }, '}': { hand: 'right', finger: 4 }, 
  '|': { hand: 'right', finger: 4 }, ':': { hand: 'right', finger: 4 },
  '"': { hand: 'right', finger: 4 }, '?': { hand: 'right', finger: 4 },
  
  // Thumbs (space)
  ' ': { hand: 'right', finger: 0 },
}

// Spanish accent characters -> fingers needed for first step (Option + key)
// Left thumb (0) for Option key + the letter finger
const ACCENT_TO_FINGERS: Record<string, ActiveFinger[]> = {
  // Acute accents - Option+e (left thumb + left middle)
  'á': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'é': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'í': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'ó': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'ú': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'Á': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'É': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'Í': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'Ó': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  'Ú': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 2 }],
  
  // Tilde - Option+n (left thumb + right index)
  'ñ': [{ hand: 'left', finger: 0 }, { hand: 'right', finger: 1 }],
  'Ñ': [{ hand: 'left', finger: 0 }, { hand: 'right', finger: 1 }],
  
  // Dieresis - Option+u (left thumb + right index)
  'ü': [{ hand: 'left', finger: 0 }, { hand: 'right', finger: 1 }],
  'Ü': [{ hand: 'left', finger: 0 }, { hand: 'right', finger: 1 }],
  
  // Inverted punctuation
  '¿': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 4 }, { hand: 'right', finger: 4 }], // Option+Shift+?
  '¡': [{ hand: 'left', finger: 0 }, { hand: 'left', finger: 4 }], // Option+1
}

interface FingerGuideProps {
  currentChar?: string
}

// Get the shift key finger for the opposite hand
function getShiftFinger(charHand: 'left' | 'right'): ActiveFinger {
  // Use opposite hand's pinky for shift
  return { hand: charHand === 'left' ? 'right' : 'left', finger: 4 }
}

export default function FingerGuide({ currentChar }: FingerGuideProps) {
  // Check if this is a Spanish accent character
  if (currentChar && isSpanishAccent(currentChar)) {
    const accentFingers = ACCENT_TO_FINGERS[currentChar]
    if (accentFingers) {
      return (
        <div className="bg-surface-raised rounded-xl p-4 border border-zinc-800">
          <HandDiagram activeFingers={accentFingers} />
        </div>
      )
    }
  }
  
  // Regular character
  const fingerInfo = currentChar ? KEY_TO_FINGER[currentChar] : undefined
  
  // Check if this character requires shift
  const needsShift = currentChar && SHIFTED_CHARS.has(currentChar)
  
  // If shift is needed, show both shift finger and character finger
  if (needsShift && fingerInfo) {
    const shiftFinger = getShiftFinger(fingerInfo.hand)
    return (
      <div className="bg-surface-raised rounded-xl p-4 border border-zinc-800">
        <HandDiagram activeFingers={[shiftFinger, fingerInfo]} />
        <p className="text-xs text-zinc-500 text-center mt-2">
          Hold {shiftFinger.hand} Shift
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-surface-raised rounded-xl p-4 border border-zinc-800">
      <HandDiagram 
        activeHand={fingerInfo?.hand || null}
        activeFinger={fingerInfo?.finger ?? null}
      />
    </div>
  )
}

