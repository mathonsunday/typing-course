'use client'

interface ActiveFinger {
  hand: 'left' | 'right'
  finger: number // 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
}

interface HandDiagramProps {
  // Legacy single-finger support
  activeHand?: 'left' | 'right' | null
  activeFinger?: number | null
  // Multi-finger support for accent key combos
  activeFingers?: ActiveFinger[]
}

// SVG paths for each finger of the LEFT hand (viewed from above while typing)
// Pinky is on the LEFT, thumb is on the RIGHT
// Fingers indexed: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
const LEFT_HAND_FINGERS = [
  // Thumb (rightmost, angled outward)
  "M 115 80 Q 125 70 130 55 Q 132 45 125 40 Q 118 35 110 42 Q 105 50 107 60 L 110 75 Z",
  // Index (second from right)
  "M 95 55 L 95 18 Q 95 10 88 10 Q 81 10 81 18 L 81 55 Z",
  // Middle (center, tallest)
  "M 78 55 L 78 12 Q 78 4 71 4 Q 64 4 64 12 L 64 55 Z",
  // Ring (second from left)
  "M 61 55 L 61 18 Q 61 10 54 10 Q 47 10 47 18 L 47 55 Z",
  // Pinky (leftmost, shortest)
  "M 44 55 L 44 28 Q 44 20 37 20 Q 30 20 30 28 L 30 55 Z",
]

const LEFT_PALM = "M 30 55 L 30 95 Q 30 110 50 115 Q 75 120 100 115 Q 115 108 115 90 L 112 70 Q 100 50 70 50 Q 40 50 30 55 Z"

// SVG paths for each finger of the RIGHT hand (viewed from above while typing)
// Thumb is on the LEFT, pinky is on the RIGHT
const RIGHT_HAND_FINGERS = [
  // Thumb (leftmost, angled outward)
  "M 35 80 Q 25 70 20 55 Q 18 45 25 40 Q 32 35 40 42 Q 45 50 43 60 L 40 75 Z",
  // Index (second from left)
  "M 55 55 L 55 18 Q 55 10 62 10 Q 69 10 69 18 L 69 55 Z",
  // Middle (center, tallest)
  "M 72 55 L 72 12 Q 72 4 79 4 Q 86 4 86 12 L 86 55 Z",
  // Ring (second from right)
  "M 89 55 L 89 18 Q 89 10 96 10 Q 103 10 103 18 L 103 55 Z",
  // Pinky (rightmost, shortest)
  "M 106 55 L 106 28 Q 106 20 113 20 Q 120 20 120 28 L 120 55 Z",
]

const RIGHT_PALM = "M 120 55 L 120 95 Q 120 110 100 115 Q 75 120 50 115 Q 35 108 35 90 L 38 70 Q 50 50 80 50 Q 110 50 120 55 Z"

const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']

export default function HandDiagram({ activeHand, activeFinger, activeFingers = [] }: HandDiagramProps) {
  // Build a set of active fingers for quick lookup
  const activeFingersSet = new Set<string>()
  
  // Support legacy single-finger props
  if (activeHand && activeFinger !== null && activeFinger !== undefined) {
    activeFingersSet.add(`${activeHand}-${activeFinger}`)
  }
  
  // Add multi-finger support
  activeFingers.forEach(af => {
    activeFingersSet.add(`${af.hand}-${af.finger}`)
  })
  
  const renderHand = (
    side: 'left' | 'right',
    fingers: string[],
    palm: string
  ) => {
    // Check if any finger on this hand is active
    const hasActiveFinger = Array.from(activeFingersSet).some(key => key.startsWith(side))
    const baseOpacity = hasActiveFinger ? 0.4 : 0.15
    const activeColor = '#6366f1'
    const inactiveColor = '#71717a'
    
    return (
      <svg viewBox="0 0 150 130" className="w-32 h-28">
        {/* Palm */}
        <path
          d={palm}
          fill={inactiveColor}
          opacity={baseOpacity}
        />
        
        {/* Fingers */}
        {fingers.map((path, idx) => {
          const isActiveFinger = activeFingersSet.has(`${side}-${idx}`)
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
  
  // Build label for active fingers
  const getActiveFingerLabels = () => {
    const labels: string[] = []
    activeFingersSet.forEach(key => {
      const [hand, fingerStr] = key.split('-')
      const finger = parseInt(fingerStr)
      labels.push(`${hand === 'left' ? 'Left' : 'Right'} ${FINGER_NAMES[finger]}`)
    })
    return labels
  }
  
  const labels = getActiveFingerLabels()
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-8">
        {renderHand('left', LEFT_HAND_FINGERS, LEFT_PALM)}
        {renderHand('right', RIGHT_HAND_FINGERS, RIGHT_PALM)}
      </div>
      
      {/* Active finger label(s) */}
      {labels.length > 0 && (
        <div className="text-sm text-zinc-300 font-medium">
          {labels.join(' + ')}
        </div>
      )}
    </div>
  )
}
