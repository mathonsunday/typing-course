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
import { useAtom } from 'jotai'
import { settingsAtom } from '@/stores/progress'

function TypingApp() {
  const [practiceText, setPracticeText] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings] = useAtom(settingsAtom)
  
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
            onComplete={() => {
              // Session auto-saved by TypingArea
            }}
            onReset={() => {
              // Restart with same text
            }}
            onDone={() => {
              // Go back to text selection / home
              setPracticeText(null)
            }}
          />
        )}
        
        {/* Session stats */}
        <SessionStats />
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
