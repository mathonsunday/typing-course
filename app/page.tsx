'use client'

import { useState } from 'react'
import { Provider } from 'jotai'
import TypingArea from '@/components/TypingArea'
import TextInput from '@/components/TextInput'
import SettingsPanel from '@/components/SettingsPanel'
import SessionStats from '@/components/SessionStats'
import DailyGoal from '@/components/DailyGoal'
import VisualAmbiance from '@/components/VisualAmbiance'
import GraduationProgress from '@/components/GraduationProgress'
import Encouragement from '@/components/Encouragement'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { settingsAtom, pausedSessionAtom, savePausedSessionAtom, clearPausedSessionAtom } from '@/stores/progress'
import type { PausedSession } from '@/lib/storage'

interface ResumeState {
  currentIndex: number
  elapsedMs: number
  correctCount: number
  errors: number[]
}

function TypingApp() {
  const [practiceText, setPracticeText] = useState<string | null>(null)
  const [resumeState, setResumeState] = useState<ResumeState | undefined>(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings] = useAtom(settingsAtom)
  const pausedSession = useAtomValue(pausedSessionAtom)
  const savePausedSession = useSetAtom(savePausedSessionAtom)
  const clearPausedSession = useSetAtom(clearPausedSessionAtom)
  
  return (
    <main className="min-h-screen bg-surface relative">
      {/* Visual ambiance background */}
      <VisualAmbiance 
        style={settings.ambianceStyle || 'none'} 
        intensity={settings.ambianceIntensity || 0.5} 
      />
      {/* Header */}
      <header className="border-b border-zinc-800 relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Typing Course</h1>
            <p className="text-xs text-zinc-500">Build proper muscle memory</p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-surface-raised rounded-lg transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Daily goal and graduation progress - shown on home screen */}
        {!practiceText && (
          <div className="max-w-4xl mx-auto mb-8 space-y-6">
            <Encouragement />
            
            {/* Paused session resume card */}
            {pausedSession && (
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-amber-300 mb-1">
                      ⏸ Session in progress
                    </h3>
                    <p className="text-xs text-amber-400/70">
                      {Math.round((pausedSession.currentIndex / pausedSession.text.length) * 100)}% complete • {Math.round(pausedSession.elapsedMs / 1000)}s elapsed
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 truncate max-w-md">
                      "{pausedSession.text.slice(0, 50)}..."
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        clearPausedSession()
                      }}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => {
                        setPracticeText(pausedSession.text)
                        setResumeState({
                          currentIndex: pausedSession.currentIndex,
                          elapsedMs: pausedSession.elapsedMs,
                          correctCount: pausedSession.correctCount,
                          errors: pausedSession.errors,
                        })
                        clearPausedSession()
                      }}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-medium text-white transition-colors"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <DailyGoal variant="full" />
            <GraduationProgress />
          </div>
        )}
        
        {/* Text input / selector */}
        <TextInput 
          onSubmit={setPracticeText} 
          currentText={practiceText || undefined}
        />
        
        {/* Typing area */}
        {practiceText && (
          <TypingArea 
            text={practiceText}
            resumeState={resumeState}
            onComplete={() => {
              // Session auto-saved by TypingArea
              setResumeState(undefined)
            }}
            onReset={() => {
              // Restart with same text
              setResumeState(undefined)
            }}
            onDone={() => {
              // Go back to text selection / home
              setPracticeText(null)
              setResumeState(undefined)
            }}
            onGoHome={(sessionState) => {
              // Save session state if in progress
              if (sessionState) {
                const paused: PausedSession = {
                  text: practiceText,
                  currentIndex: sessionState.currentIndex,
                  elapsedMs: sessionState.elapsedMs,
                  correctCount: sessionState.correctCount,
                  errors: sessionState.errors,
                  pausedAt: Date.now(),
                }
                savePausedSession(paused)
              }
              setPracticeText(null)
              setResumeState(undefined)
            }}
          />
        )}
        
        {/* Session stats - only show on home screen */}
        {!practiceText && <SessionStats />}
      </div>
      
      {/* Settings panel */}
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </main>
  )
}

export default function Home() {
  return (
    <Provider>
      <TypingApp />
    </Provider>
  )
}
