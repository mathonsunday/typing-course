/**
 * Spanish accent support - Mac Option-key shortcuts
 * 
 * On Mac, accented characters are typed using "dead keys":
 * 1. Press Option + modifier key (this sets up the accent)
 * 2. Press the base letter (this combines them)
 */

export interface AccentInstruction {
  char: string
  steps: string[]
  shortDescription: string
}

// Map of Spanish accented characters to their Mac Option-key instructions
const SPANISH_ACCENT_MAP: Record<string, AccentInstruction> = {
  // Acute accents (most common in Spanish) - Option+e is the "acute accent" dead key
  'á': { char: 'á', steps: ['Option + e', 'then a'], shortDescription: '⌥e → a' },
  'é': { char: 'é', steps: ['Option + e', 'then e'], shortDescription: '⌥e → e' },
  'í': { char: 'í', steps: ['Option + e', 'then i'], shortDescription: '⌥e → i' },
  'ó': { char: 'ó', steps: ['Option + e', 'then o'], shortDescription: '⌥e → o' },
  'ú': { char: 'ú', steps: ['Option + e', 'then u'], shortDescription: '⌥e → u' },
  
  // Uppercase acute accents
  'Á': { char: 'Á', steps: ['Option + e', 'then Shift + a'], shortDescription: '⌥e → A' },
  'É': { char: 'É', steps: ['Option + e', 'then Shift + e'], shortDescription: '⌥e → E' },
  'Í': { char: 'Í', steps: ['Option + e', 'then Shift + i'], shortDescription: '⌥e → I' },
  'Ó': { char: 'Ó', steps: ['Option + e', 'then Shift + o'], shortDescription: '⌥e → O' },
  'Ú': { char: 'Ú', steps: ['Option + e', 'then Shift + u'], shortDescription: '⌥e → U' },
  
  // Tilde (ñ) - Option+n is the "tilde" dead key
  'ñ': { char: 'ñ', steps: ['Option + n', 'then n'], shortDescription: '⌥n → n' },
  'Ñ': { char: 'Ñ', steps: ['Option + n', 'then Shift + n'], shortDescription: '⌥n → N' },
  
  // Dieresis (ü) - Option+u is the "umlaut/dieresis" dead key (used in güe, güi)
  'ü': { char: 'ü', steps: ['Option + u', 'then u'], shortDescription: '⌥u → u' },
  'Ü': { char: 'Ü', steps: ['Option + u', 'then Shift + u'], shortDescription: '⌥u → U' },
  
  // Inverted punctuation - direct Option shortcuts
  '¿': { char: '¿', steps: ['Option + Shift + ?'], shortDescription: '⌥⇧?' },
  '¡': { char: '¡', steps: ['Option + 1'], shortDescription: '⌥1' },
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
