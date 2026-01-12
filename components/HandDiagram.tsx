'use client'

interface HandDiagramProps {
  activeHand: 'left' | 'right' | null
  activeFinger: number | null // 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
}

// SVG paths for each finger of the left hand
// Fingers indexed: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
const LEFT_HAND_FINGERS = [
  // Thumb
  "M 45 85 Q 30 75 25 60 Q 22 50 28 42 Q 35 35 45 40 Q 52 45 52 55 L 50 75 Z",
  // Index
  "M 55 55 L 55 20 Q 55 12 62 12 Q 69 12 69 20 L 69 55 Z",
  // Middle
  "M 72 55 L 72 15 Q 72 7 79 7 Q 86 7 86 15 L 86 55 Z",
  // Ring
  "M 89 55 L 89 20 Q 89 12 96 12 Q 103 12 103 20 L 103 55 Z",
  // Pinky
  "M 106 55 L 106 30 Q 106 22 113 22 Q 120 22 120 30 L 120 55 Z",
]

// Palm base
const LEFT_PALM = "M 50 55 L 50 95 Q 50 110 65 115 Q 85 120 105 115 Q 120 110 120 95 L 120 55 Q 110 50 85 50 Q 60 50 50 55 Z"

// Mirror for right hand (flip horizontally around center)
const RIGHT_HAND_FINGERS = [
  // Thumb (mirrored)
  "M 105 85 Q 120 75 125 60 Q 128 50 122 42 Q 115 35 105 40 Q 98 45 98 55 L 100 75 Z",
  // Index
  "M 95 55 L 95 20 Q 95 12 88 12 Q 81 12 81 20 L 81 55 Z",
  // Middle
  "M 78 55 L 78 15 Q 78 7 71 7 Q 64 7 64 15 L 64 55 Z",
  // Ring
  "M 61 55 L 61 20 Q 61 12 54 12 Q 47 12 47 20 L 47 55 Z",
  // Pinky
  "M 44 55 L 44 30 Q 44 22 37 22 Q 30 22 30 30 L 30 55 Z",
]

const RIGHT_PALM = "M 100 55 L 100 95 Q 100 110 85 115 Q 65 120 45 115 Q 30 110 30 95 L 30 55 Q 40 50 65 50 Q 90 50 100 55 Z"

const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']

export default function HandDiagram({ activeHand, activeFinger }: HandDiagramProps) {
  const renderHand = (
    side: 'left' | 'right',
    fingers: string[],
    palm: string
  ) => {
    const isActiveHand = activeHand === side
    const baseOpacity = isActiveHand ? 0.4 : 0.15
    const activeColor = '#6366f1'
    const inactiveColor = '#71717a'
    
    return (
      <svg viewBox="0 0 150 130" className="w-32 h-28">
        {/* Palm */}
        <path
          d={palm}
          fill={isActiveHand ? inactiveColor : inactiveColor}
          opacity={baseOpacity}
        />
        
        {/* Fingers */}
        {fingers.map((path, idx) => {
          const isActiveFinger = isActiveHand && activeFinger === idx
          return (
            <path
              key={idx}
              d={path}
              fill={isActiveFinger ? activeColor : inactiveColor}
              opacity={isActiveFinger ? 1 : baseOpacity}
              className={isActiveFinger ? 'animate-pulse' : ''}
            />
          )
        })}
        
        {/* Hand label */}
        <text
          x="75"
          y="125"
          textAnchor="middle"
          className="text-xs fill-zinc-500"
          fontSize="10"
        >
          {side === 'left' ? 'LEFT' : 'RIGHT'}
        </text>
      </svg>
    )
  }
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-8">
        {renderHand('left', LEFT_HAND_FINGERS, LEFT_PALM)}
        {renderHand('right', RIGHT_HAND_FINGERS, RIGHT_PALM)}
      </div>
      
      {/* Active finger label */}
      {activeHand && activeFinger !== null && (
        <div className="text-sm text-zinc-300 font-medium">
          {activeHand === 'left' ? 'Left' : 'Right'} {FINGER_NAMES[activeFinger]}
        </div>
      )}
    </div>
  )
}
