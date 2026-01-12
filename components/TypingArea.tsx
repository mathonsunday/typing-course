'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { settingsAtom, saveSessionAtom } from '@/stores/progress'
import { playKeystrokeSound, playErrorSound, playCompletionSound, ensureAudioReady } from '@/lib/sounds'
import { trackKeystroke, createSession, calculateWPM } from '@/lib/analytics'
import type { CharacterStats } from '@/lib/storage'
import FingerGuide from './FingerGuide'
import DailyGoal from './DailyGoal'
import AccentHint from './AccentHint'

interface TypingAreaProps {
  text: string
  onComplete?: () => void
  onReset?: () => void
}

// Number of lines to show at once
const VISIBLE_LINES = 3

export default function TypingArea({ text, onComplete, onReset }: TypingAreaProps) {
  const [settings] = useAtom(settingsAtom)
  const saveSession = useSetAtom(saveSessionAtom)
  
  // Session state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [currentWPM, setCurrentWPM] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(null)
  const [isIdle, setIsIdle] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{ char: string; composing: boolean; timestamp: number } | null>(null)
  
  // Idle timeout in ms (5 seconds)
  const IDLE_TIMEOUT = 5000
  
  // Analytics tracking
  const characterAccuracyRef = useRef<Record<string, CharacterStats>>({})
  const bigramAccuracyRef = useRef<Record<string, CharacterStats>>({})
  const correctCountRef = useRef(0)
  const activeTimeRef = useRef(0) // Accumulated active typing time in ms
  const lastTickRef = useRef<number | null>(null) // For calculating time deltas
  
  // Container ref for focus management
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Split text into lines for windowed display
  // Each line is an exact slice of the original text with correct indices
  const lines = useMemo(() => {
    if (!text || text.length === 0) {
      return [{ text: '', startIndex: 0 }]
    }
    
    const MAX_LINE_LENGTH = 55
    const result: { text: string; startIndex: number }[] = []
    
    let lineStart = 0
    
    while (lineStart < text.length) {
      // Calculate potential line end
      let lineEnd = Math.min(lineStart + MAX_LINE_LENGTH, text.length)
      
      // If we're not at the end of text, try to break at a word boundary
      if (lineEnd < text.length) {
        // Look backwards for a space to break at
        let breakPoint = lineEnd
        while (breakPoint > lineStart && text[breakPoint] !== ' ') {
          breakPoint--
        }
        
        if (breakPoint > lineStart) {
          // Found a space - include it at the end of this line, next line starts after it
          lineEnd = breakPoint + 1
        }
        // If no space found (very long word), just break at MAX_LINE_LENGTH
      }
      
      result.push({
        text: text.slice(lineStart, lineEnd),
        startIndex: lineStart
      })
      
      lineStart = lineEnd
    }
    
    return result
  }, [text])
  
  // Determine which line the cursor is on and visible window
  const currentLineIndex = useMemo(() => {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (currentIndex >= lines[i].startIndex) {
        return i
      }
    }
    return 0
  }, [currentIndex, lines])
  
  // Calculate visible line range (show current line and context)
  const visibleRange = useMemo(() => {
    // Keep current line in the middle when possible
    let start = Math.max(0, currentLineIndex - 1)
    let end = Math.min(lines.length, start + VISIBLE_LINES)
    
    // Adjust start if we're near the end
    if (end - start < VISIBLE_LINES) {
      start = Math.max(0, end - VISIBLE_LINES)
    }
    
    return { start, end }
  }, [currentLineIndex, lines.length])
  
  // Reset session
  const resetSession = useCallback(() => {
    setCurrentIndex(0)
    setErrors(new Set())
    setStartTime(null)
    setIsComplete(false)
    setCurrentWPM(0)
    setElapsedMs(0)
    setLastKeystrokeTime(null)
    setIsIdle(false)
    characterAccuracyRef.current = {}
    bigramAccuracyRef.current = {}
    correctCountRef.current = 0
    activeTimeRef.current = 0
    lastTickRef.current = null
    hiddenInputRef.current?.focus()
  }, [])
  
  // Reset when text changes
  useEffect(() => {
    resetSession()
  }, [text, resetSession])
  
  // Update WPM and elapsed time every 100ms during typing (with idle detection)
  useEffect(() => {
    if (!startTime || isComplete) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      
      // Check if idle (no keystroke for IDLE_TIMEOUT ms)
      const timeSinceLastKeystroke = lastKeystrokeTime ? now - lastKeystrokeTime : 0
      const currentlyIdle = timeSinceLastKeystroke > IDLE_TIMEOUT
      setIsIdle(currentlyIdle)
      
      // Only accumulate time if not idle
      if (!currentlyIdle && lastTickRef.current) {
        const delta = now - lastTickRef.current
        activeTimeRef.current += delta
        setElapsedMs(activeTimeRef.current)
        setCurrentWPM(calculateWPM(correctCountRef.current, activeTimeRef.current))
      }
      
      lastTickRef.current = currentlyIdle ? null : now
    }, 100)
    
    return () => clearInterval(interval)
  }, [startTime, isComplete, lastKeystrokeTime, IDLE_TIMEOUT])
  
  // Reference for hidden input that handles dead key composition
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  // Track if we're in the middle of composing (dead key active)
  const isComposingRef = useRef(false)
  
  // Handle special keys (backspace, enter, etc.)
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    // Ignore modifier-only presses and navigation
    if (e.key === 'Tab' || e.key === 'Escape') return
    
    // Handle restart with Enter when complete
    if (isComplete && e.key === 'Enter') {
      resetSession()
      onReset?.()
      return
    }
    
    if (isComplete) return
    
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1
        setCurrentIndex(newIndex)
        setErrors(prev => {
          const next = new Set(prev)
          next.delete(newIndex)
          return next
        })
      }
      return
    }
  }, [isComplete, resetSession, onReset, currentIndex])
  
  // Handle composition events (for dead key / accent input)
  const handleCompositionStart = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = true
    setDebugInfo({ char: `composing: "${e.data || '?'}"`, composing: true, timestamp: Date.now() })
  }, [])
  
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    setDebugInfo({ char: `composed: "${e.data}"`, composing: false, timestamp: Date.now() })
  }, [])
  
  // Handle actual character input (supports dead keys / accent composition)
  const handleInput = useCallback(async (e: React.FormEvent<HTMLInputElement>) => {
    // Skip if we're in the middle of composition (dead key waiting for next char)
    if (isComposingRef.current) {
      setDebugInfo({ char: `(skipped - composing)`, composing: true, timestamp: Date.now() })
      return
    }
    
    const input = e.currentTarget
    const typedChar = input.value
    
    // Clear the input immediately
    input.value = ''
    
    // Ignore if no character
    if (!typedChar) return
    
    // Take only the last character (in case multiple accumulated)
    const char = typedChar.slice(-1)
    
    // Debug: show what we received
    setDebugInfo({ char: `received: "${char}" (code: ${char.charCodeAt(0)})`, composing: false, timestamp: Date.now() })
    
    if (isComplete) return
    
    // Ensure audio is ready (browser autoplay policy)
    await ensureAudioReady()
    
    const now = Date.now()
    
    // Start timer on first keystroke
    if (startTime === null) {
      setStartTime(now)
      lastTickRef.current = now
    }
    
    // Track last keystroke time for idle detection
    setLastKeystrokeTime(now)
    
    // Resume timer if we were idle
    if (isIdle) {
      lastTickRef.current = now
    }
    
    const expectedChar = text[currentIndex]
    const prevChar = currentIndex > 0 ? text[currentIndex - 1] : null
    
    // Track analytics
    const isCorrect = trackKeystroke(
      expectedChar,
      char,
      prevChar,
      characterAccuracyRef.current,
      bigramAccuracyRef.current
    )
    
    if (isCorrect) {
      correctCountRef.current++
      if (settings.soundEnabled) {
        playKeystrokeSound(settings.soundVolume)
      }
    } else {
      setErrors(prev => new Set(prev).add(currentIndex))
      if (settings.soundEnabled) {
        playErrorSound(settings.soundVolume)
      }
    }
    
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)
    
    // Check for completion
    if (newIndex >= text.length) {
      // Use active time, not wall clock time
      const duration = activeTimeRef.current
      
      setIsComplete(true)
      setCurrentWPM(calculateWPM(correctCountRef.current, duration))
      
      if (settings.soundEnabled) {
        playCompletionSound(settings.soundVolume)
      }
      
      // Save session
      const session = createSession(
        text,
        text.length,
        correctCountRef.current,
        duration,
        characterAccuracyRef.current,
        bigramAccuracyRef.current
      )
      saveSession(session)
      onComplete?.()
    }
  }, [currentIndex, text, startTime, isComplete, isIdle, settings, saveSession, onComplete])
  
  // Calculate current accuracy
  const accuracy = currentIndex > 0 
    ? ((correctCountRef.current / currentIndex) * 100).toFixed(1)
    : '100.0'
  
  // Render a single line with character styling
  const renderLine = (line: { text: string; startIndex: number }, lineIndex: number) => {
    return (
      <div key={lineIndex} className="leading-relaxed">
        {line.text.split('').map((char, charIndex) => {
          const globalIndex = line.startIndex + charIndex
          let className = 'char-pending'
          
          if (globalIndex < currentIndex) {
            className = errors.has(globalIndex) ? 'char-error' : 'char-correct'
          } else if (globalIndex === currentIndex) {
            className = 'char-current'
          }
          
          // Handle whitespace visibility
          const displayChar = char === ' ' ? '\u00A0' : char
          
          return (
            <span key={globalIndex} className={className}>
              {displayChar}
            </span>
          )
        })}
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 text-sm text-zinc-400">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-zinc-500">WPM</span>{' '}
            <span className="text-zinc-100 font-medium">{currentWPM}</span>
          </div>
          <div>
            <span className="text-zinc-500">Accuracy</span>{' '}
            <span className="text-zinc-100 font-medium">{accuracy}%</span>
          </div>
          <div>
            <span className="text-zinc-500">Progress</span>{' '}
            <span className="text-zinc-100 font-medium">
              {currentLineIndex + 1}/{lines.length} lines
            </span>
          </div>
          <div className="border-l border-zinc-700 pl-6 flex items-center gap-2">
            <span className="text-zinc-500">Daily</span>{' '}
            <DailyGoal variant="compact" currentSessionMs={elapsedMs} />
            {isIdle && startTime && !isComplete && (
              <span className="text-yellow-500 text-xs animate-pulse">⏸ Paused</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {settings.soundEnabled && (
            <div className="text-zinc-500 text-xs">
              🔊 Sound on
            </div>
          )}
        </div>
      </div>
      
      {/* Typing area */}
      <div
        ref={containerRef}
        className="relative bg-surface-raised rounded-xl p-8 border border-zinc-800 focus-within:border-accent/50 transition-colors cursor-text"
        onClick={() => hiddenInputRef.current?.focus()}
      >
        {/* Hidden input for proper dead key / accent composition support */}
        <input
          ref={hiddenInputRef}
          type="text"
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {/* Line container with fixed height for smooth scrolling feel */}
        <div className="text-xl tracking-wide font-mono space-y-2 min-h-[140px]">
          {lines.slice(visibleRange.start, visibleRange.end).map((line, idx) => 
            renderLine(line, visibleRange.start + idx)
          )}
        </div>
        
        {/* Line progress indicator */}
        {lines.length > VISIBLE_LINES && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {lines.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx < currentLineIndex 
                    ? 'bg-correct' 
                    : idx === currentLineIndex 
                      ? 'bg-accent' 
                      : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Click to focus hint */}
        {currentIndex === 0 && !startTime && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-raised/80 rounded-xl">
            <p className="text-zinc-500">Click here and start typing</p>
          </div>
        )}
        
        {/* Completion overlay */}
        {isComplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-raised/95 rounded-xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
                Session Complete!
              </h2>
              <div className="flex items-center gap-8 mb-6 text-lg">
                <div>
                  <div className="text-zinc-500 text-sm">WPM</div>
                  <div className="text-accent-bright font-semibold text-2xl">
                    {currentWPM}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-sm">Accuracy</div>
                  <div className="text-accent-bright font-semibold text-2xl">
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-sm">Characters</div>
                  <div className="text-accent-bright font-semibold text-2xl">
                    {text.length}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-sm">Errors</div>
                  <div className="text-accent-bright font-semibold text-2xl">
                    {errors.size}
                  </div>
                </div>
              </div>
              <p className="text-zinc-500">
                Press <kbd className="px-2 py-1 bg-surface rounded text-zinc-300">Enter</kbd> to restart
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-1 bg-surface-raised rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-150 ease-out"
          style={{ width: `${(currentIndex / text.length) * 100}%` }}
        />
      </div>
      
      {/* Debug info for accent input troubleshooting */}
      {debugInfo && (
        <div className="mt-3 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono">
          <span className="text-zinc-500">Debug: </span>
          <span className={debugInfo.composing ? 'text-yellow-400' : 'text-green-400'}>
            {debugInfo.char}
          </span>
          <span className="text-zinc-600 ml-2">
            | Expected: "{text[currentIndex]}" (code: {text[currentIndex]?.charCodeAt(0)})
          </span>
        </div>
      )}
      
      {/* Spanish accent hint */}
      {!isComplete && (
        <div className="mt-6">
          <AccentHint currentChar={text[currentIndex]} />
        </div>
      )}
      
      {/* Finger placement guide */}
      {settings.showFingerGuide && !isComplete && (
        <div className="mt-4">
          <FingerGuide currentChar={text[currentIndex]} />
        </div>
      )}
    </div>
  )
}
