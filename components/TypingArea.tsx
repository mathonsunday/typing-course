'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { settingsAtom, saveSessionAtom } from '@/stores/progress'
import { playKeystrokeSound, playErrorSound, playCompletionSound, ensureAudioReady } from '@/lib/sounds'
import { trackKeystroke, createSession, calculateWPM } from '@/lib/analytics'
import type { CharacterStats } from '@/lib/storage'

interface TypingAreaProps {
  text: string
  onComplete?: () => void
  onReset?: () => void
}

export default function TypingArea({ text, onComplete, onReset }: TypingAreaProps) {
  const [settings] = useAtom(settingsAtom)
  const saveSession = useSetAtom(saveSessionAtom)
  
  // Session state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [currentWPM, setCurrentWPM] = useState(0)
  
  // Analytics tracking
  const characterAccuracyRef = useRef<Record<string, CharacterStats>>({})
  const bigramAccuracyRef = useRef<Record<string, CharacterStats>>({})
  const correctCountRef = useRef(0)
  
  // Container ref for focus management
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Reset session
  const resetSession = useCallback(() => {
    setCurrentIndex(0)
    setErrors(new Set())
    setStartTime(null)
    setIsComplete(false)
    setCurrentWPM(0)
    characterAccuracyRef.current = {}
    bigramAccuracyRef.current = {}
    correctCountRef.current = 0
    containerRef.current?.focus()
  }, [])
  
  // Reset when text changes
  useEffect(() => {
    resetSession()
  }, [text, resetSession])
  
  // Update WPM every second during typing
  useEffect(() => {
    if (!startTime || isComplete) return
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setCurrentWPM(calculateWPM(correctCountRef.current, elapsed))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [startTime, isComplete])
  
  // Handle keypress
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    // Ignore modifier keys and special keys
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'Tab' || e.key === 'Escape') return
    
    // Handle restart with Enter when complete
    if (isComplete && e.key === 'Enter') {
      resetSession()
      onReset?.()
      return
    }
    
    if (isComplete) return
    
    // Ensure audio is ready (browser autoplay policy)
    await ensureAudioReady()
    
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
    
    // Ignore other special keys
    if (e.key.length !== 1) return
    
    e.preventDefault()
    
    // Start timer on first keystroke
    if (startTime === null) {
      setStartTime(Date.now())
    }
    
    const expectedChar = text[currentIndex]
    const typedChar = e.key
    const prevChar = currentIndex > 0 ? text[currentIndex - 1] : null
    
    // Track analytics
    const isCorrect = trackKeystroke(
      expectedChar,
      typedChar,
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
      const endTime = Date.now()
      const duration = endTime - (startTime || endTime)
      
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
  }, [currentIndex, text, startTime, isComplete, settings, saveSession, onComplete, onReset, resetSession])
  
  // Calculate current accuracy
  const accuracy = currentIndex > 0 
    ? ((correctCountRef.current / currentIndex) * 100).toFixed(1)
    : '100.0'
  
  // Render characters with appropriate styling
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'char-pending'
      
      if (index < currentIndex) {
        className = errors.has(index) ? 'char-error' : 'char-correct'
      } else if (index === currentIndex) {
        className = 'char-current'
      }
      
      // Handle whitespace visibility
      const displayChar = char === ' ' ? '\u00A0' : char
      
      return (
        <span key={index} className={className}>
          {displayChar}
        </span>
      )
    })
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
              {currentIndex}/{text.length}
            </span>
          </div>
        </div>
        {settings.soundEnabled && (
          <div className="text-zinc-500 text-xs">
            🔊 Sound on
          </div>
        )}
      </div>
      
      {/* Typing area */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative bg-surface-raised rounded-xl p-8 border border-zinc-800 focus:border-accent/50 transition-colors cursor-text min-h-[200px]"
        onClick={() => containerRef.current?.focus()}
      >
        <div className="text-xl leading-relaxed tracking-wide font-mono">
          {renderText()}
        </div>
        
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
    </div>
  )
}
