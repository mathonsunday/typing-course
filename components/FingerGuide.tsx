'use client'

import HandDiagram from './HandDiagram'

// Finger types
type FingerName = 'leftPinky' | 'leftRing' | 'leftMiddle' | 'leftIndex' | 
                  'rightIndex' | 'rightMiddle' | 'rightRing' | 'rightPinky' | 'thumb'

// Map finger names to hand/finger index for HandDiagram
// Finger indices: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
const FINGER_TO_HAND_INDEX: Record<FingerName, { hand: 'left' | 'right'; finger: number }> = {
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
const KEY_TO_FINGER: Record<string, FingerName> = {
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

interface FingerGuideProps {
  currentChar?: string
}

export default function FingerGuide({ currentChar }: FingerGuideProps) {
  const currentFinger = currentChar ? KEY_TO_FINGER[currentChar] : undefined
  const handIndex = currentFinger ? FINGER_TO_HAND_INDEX[currentFinger] : undefined
  
  return (
    <div className="bg-surface-raised rounded-xl p-4 border border-zinc-800">
      <HandDiagram 
        activeHand={handIndex?.hand || null}
        activeFinger={handIndex?.finger ?? null}
      />
    </div>
  )
}

