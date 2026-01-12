/**
 * Character coverage validation for evaluation texts
 * 
 * For graduation, texts must include all required character groups
 * to ensure users have practiced everything they need.
 */

// Required character groups for prose typing (no programming symbols)
export const REQUIRED_CHARACTERS = {
  letters: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  punctuation: '.,;:!?-',
  quotes: `'"`,
  parens: '()',
}

// Minimum word count for reliable WPM measurement
export const MIN_WORDS_FOR_EVALUATION = 100

export interface CoverageResult {
  isComplete: boolean
  wordCount: number
  missingCharacters: string[]
  coverage: {
    letters: { covered: string[]; missing: string[] }
    numbers: { covered: string[]; missing: string[] }
    punctuation: { covered: string[]; missing: string[] }
    quotes: { covered: string[]; missing: string[] }
    parens: { covered: string[]; missing: string[] }
  }
  percentComplete: number
}

/**
 * Check if a text covers all required characters for evaluation
 */
export function checkCoverage(text: string): CoverageResult {
  const lowerText = text.toLowerCase()
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  
  const checkGroup = (required: string) => {
    const covered: string[] = []
    const missing: string[] = []
    
    for (const char of required) {
      if (lowerText.includes(char) || text.includes(char)) {
        covered.push(char)
      } else {
        missing.push(char)
      }
    }
    
    return { covered, missing }
  }
  
  const coverage = {
    letters: checkGroup(REQUIRED_CHARACTERS.letters),
    numbers: checkGroup(REQUIRED_CHARACTERS.numbers),
    punctuation: checkGroup(REQUIRED_CHARACTERS.punctuation),
    quotes: checkGroup(REQUIRED_CHARACTERS.quotes),
    parens: checkGroup(REQUIRED_CHARACTERS.parens),
  }
  
  const allRequired = Object.values(REQUIRED_CHARACTERS).join('')
  const totalRequired = allRequired.length
  const totalCovered = Object.values(coverage).reduce(
    (sum, group) => sum + group.covered.length, 
    0
  )
  
  const missingCharacters = Object.values(coverage).flatMap(g => g.missing)
  
  const isComplete = missingCharacters.length === 0 && wordCount >= MIN_WORDS_FOR_EVALUATION
  const percentComplete = Math.round((totalCovered / totalRequired) * 100)
  
  return {
    isComplete,
    wordCount,
    missingCharacters,
    coverage,
    percentComplete,
  }
}

/**
 * Get a human-readable summary of what's missing
 */
export function getMissingSummary(result: CoverageResult): string[] {
  const issues: string[] = []
  
  if (result.wordCount < MIN_WORDS_FOR_EVALUATION) {
    issues.push(`Text is too short (${result.wordCount} words, need ${MIN_WORDS_FOR_EVALUATION}+)`)
  }
  
  if (result.coverage.letters.missing.length > 0) {
    issues.push(`Missing letters: ${result.coverage.letters.missing.join(', ')}`)
  }
  
  if (result.coverage.numbers.missing.length > 0) {
    issues.push(`Missing numbers: ${result.coverage.numbers.missing.join(', ')}`)
  }
  
  if (result.coverage.punctuation.missing.length > 0) {
    issues.push(`Missing punctuation: ${result.coverage.punctuation.missing.join(' ')}`)
  }
  
  if (result.coverage.quotes.missing.length > 0) {
    issues.push(`Missing quotes: ${result.coverage.quotes.missing.join(' ')}`)
  }
  
  if (result.coverage.parens.missing.length > 0) {
    issues.push(`Missing: ${result.coverage.parens.missing.join(' ')}`)
  }
  
  return issues
}
