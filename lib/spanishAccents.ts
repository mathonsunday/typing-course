/**
 * Spanish accent support - Mac Option-key shortcuts
 * 
 * On Mac, accented characters are typed using "dead keys":
 * 1. Press Option + modifier key (this sets up the accent)
 * 2. Press the base letter (this combines them)
 */

export interface AccentStep {
  keys: string
  fingers: string
}

export interface AccentInstruction {
  char: string
  steps: AccentStep[]
  shortDescription: string
}

// Map of Spanish accented characters to their Mac Option-key instructions
// Finger guidance: Option key is pressed with left thumb, letters with standard fingers
const SPANISH_ACCENT_MAP: Record<string, AccentInstruction> = {
  // Acute accents (most common in Spanish) - Option+e is the "acute accent" dead key
  'á': { 
    char: 'á', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'a', fingers: 'Left pinky' }
    ],
    shortDescription: '⌥e → a' 
  },
  'é': { 
    char: 'é', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'e', fingers: 'Left middle' }
    ],
    shortDescription: '⌥e → e' 
  },
  'í': { 
    char: 'í', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'i', fingers: 'Right middle' }
    ],
    shortDescription: '⌥e → i' 
  },
  'ó': { 
    char: 'ó', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'o', fingers: 'Right ring' }
    ],
    shortDescription: '⌥e → o' 
  },
  'ú': { 
    char: 'ú', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'u', fingers: 'Right index' }
    ],
    shortDescription: '⌥e → u' 
  },
  
  // Uppercase acute accents
  'Á': { 
    char: 'Á', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'Shift + a', fingers: 'Right pinky + Left pinky' }
    ],
    shortDescription: '⌥e → A' 
  },
  'É': { 
    char: 'É', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'Shift + e', fingers: 'Right pinky + Left middle' }
    ],
    shortDescription: '⌥e → E' 
  },
  'Í': { 
    char: 'Í', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'Shift + i', fingers: 'Left pinky + Right middle' }
    ],
    shortDescription: '⌥e → I' 
  },
  'Ó': { 
    char: 'Ó', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'Shift + o', fingers: 'Left pinky + Right ring' }
    ],
    shortDescription: '⌥e → O' 
  },
  'Ú': { 
    char: 'Ú', 
    steps: [
      { keys: 'Option + e', fingers: 'Left thumb + Left middle' },
      { keys: 'Shift + u', fingers: 'Left pinky + Right index' }
    ],
    shortDescription: '⌥e → U' 
  },
  
  // Tilde (ñ) - Option+n is the "tilde" dead key
  'ñ': { 
    char: 'ñ', 
    steps: [
      { keys: 'Option + n', fingers: 'Left thumb + Right index' },
      { keys: 'n', fingers: 'Right index' }
    ],
    shortDescription: '⌥n → n' 
  },
  'Ñ': { 
    char: 'Ñ', 
    steps: [
      { keys: 'Option + n', fingers: 'Left thumb + Right index' },
      { keys: 'Shift + n', fingers: 'Left pinky + Right index' }
    ],
    shortDescription: '⌥n → N' 
  },
  
  // Dieresis (ü) - Option+u is the "umlaut/dieresis" dead key (used in güe, güi)
  'ü': { 
    char: 'ü', 
    steps: [
      { keys: 'Option + u', fingers: 'Left thumb + Right index' },
      { keys: 'u', fingers: 'Right index' }
    ],
    shortDescription: '⌥u → u' 
  },
  'Ü': { 
    char: 'Ü', 
    steps: [
      { keys: 'Option + u', fingers: 'Left thumb + Right index' },
      { keys: 'Shift + u', fingers: 'Left pinky + Right index' }
    ],
    shortDescription: '⌥u → U' 
  },
  
  // Inverted punctuation - direct Option shortcuts
  '¿': { 
    char: '¿', 
    steps: [
      { keys: 'Option + Shift + ?', fingers: 'Left thumb + Left pinky + Right pinky' }
    ],
    shortDescription: '⌥⇧?' 
  },
  '¡': { 
    char: '¡', 
    steps: [
      { keys: 'Option + 1', fingers: 'Left thumb + Left pinky' }
    ],
    shortDescription: '⌥1' 
  },
}

/**
 * Check if a character is a Spanish accented character
 */
export function isSpanishAccent(char: string): boolean {
  return char in SPANISH_ACCENT_MAP
}

/**
 * Get typing instructions for a Spanish accented character
 */
export function getAccentInstruction(char: string): AccentInstruction | null {
  return SPANISH_ACCENT_MAP[char] || null
}

/**
 * Get all Spanish accent characters (for reference)
 */
export function getAllSpanishAccents(): string[] {
  return Object.keys(SPANISH_ACCENT_MAP)
}
