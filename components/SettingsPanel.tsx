'use client'

import { useAtom } from 'jotai'
import { settingsAtom, progressAtom, dailyGoalMinutesAtom } from '@/stores/progress'
import { useRef } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

const SOUND_PROFILES = [
  { id: 'mxBrown', name: 'MX Brown', desc: 'Soft tactile' },
  { id: 'mxBlue', name: 'MX Blue', desc: 'Clicky' },
  { id: 'thocky', name: 'Thocky', desc: 'Deep bass' },
  { id: 'typewriter', name: 'Typewriter', desc: 'Classic' },
  { id: 'bubble', name: 'Bubble', desc: 'Playful' },
  { id: 'minimal', name: 'Minimal', desc: 'Subtle' },
] as const

const AMBIANCE_STYLES = [
  { id: 'none', name: 'None' },
  { id: 'particles', name: 'Particles' },
  { id: 'both', name: 'Particles + Glow' },
] as const

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useAtom(settingsAtom)
  const [progress, setProgress] = useAtom(progressAtom)
  const [dailyGoal, setDailyGoal] = useAtom(dailyGoalMinutesAtom)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleExport = () => {
    const dataStr = JSON.stringify(progress, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `typing-course-progress-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        // Basic validation
        if (imported.sessions && imported.settings) {
          setProgress(imported)
          alert('Progress imported successfully!')
        } else {
          alert('Invalid file format')
        }
      } catch {
        alert('Failed to parse file')
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-surface-raised rounded-xl border border-zinc-800 p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Daily goal setting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-zinc-100">Daily goal</div>
              <div className="text-sm text-zinc-400">{dailyGoal} min</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {GOAL_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setDailyGoal(minutes)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    dailyGoal === minutes
                      ? 'bg-accent text-white'
                      : 'bg-surface text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
          
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-100">Sound feedback</div>
              <div className="text-xs text-zinc-500">Play sounds on keystrokes</div>
            </div>
            <button
              onClick={() => setSettings({ soundEnabled: !settings.soundEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-accent' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
          
          {/* Sound settings (when enabled) */}
          {settings.soundEnabled && (
            <>
              {/* Volume slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-zinc-100">Volume</div>
                  <div className="text-xs text-zinc-500">
                    {Math.round(settings.soundVolume * 100)}%
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume * 100}
                  onChange={(e) => setSettings({ soundVolume: Number(e.target.value) / 100 })}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              
              {/* Sound profile selector */}
              <div>
                <div className="text-sm font-medium text-zinc-100 mb-2">Keyboard sound</div>
                <div className="grid grid-cols-3 gap-2">
                  {SOUND_PROFILES.map(({ id, name, desc }) => (
                    <button
                      key={id}
                      onClick={() => setSettings({ soundProfile: id as any })}
                      className={`px-2 py-2 rounded-lg text-xs transition-colors ${
                        settings.soundProfile === id
                          ? 'bg-accent text-white'
                          : 'bg-surface text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-medium">{name}</div>
                      <div className="text-zinc-500 text-[10px]">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Finger guide toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-100">Finger placement guide</div>
              <div className="text-xs text-zinc-500">Show recommended finger positions</div>
            </div>
            <button
              onClick={() => setSettings({ showFingerGuide: !settings.showFingerGuide })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.showFingerGuide ? 'bg-accent' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showFingerGuide ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
          
          {/* Finger guide mode selector */}
          {settings.showFingerGuide && (
            <div>
              <div className="text-sm font-medium text-zinc-100 mb-2">Guide style</div>
              <div className="flex gap-2">
                {[
                  { mode: 'text' as const, label: 'Text', desc: 'Simple text' },
                  { mode: 'hands' as const, label: 'Hands', desc: 'Hand diagram' },
                  { mode: 'keyboard' as const, label: 'Keyboard', desc: 'Color keys' },
                ].map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => setSettings({ fingerGuideMode: mode })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      settings.fingerGuideMode === mode
                        ? 'bg-accent text-white'
                        : 'bg-surface text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Visual ambiance */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="text-sm font-medium text-zinc-100 mb-2">Visual ambiance</div>
            <div className="flex gap-2 mb-3">
              {AMBIANCE_STYLES.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setSettings({ ambianceStyle: id as any })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    settings.ambianceStyle === id
                      ? 'bg-accent text-white'
                      : 'bg-surface text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            
            {settings.ambianceStyle !== 'none' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-zinc-400">Intensity</div>
                  <div className="text-xs text-zinc-500">
                    {Math.round(settings.ambianceIntensity * 100)}%
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.ambianceIntensity * 100}
                  onChange={(e) => setSettings({ ambianceIntensity: Number(e.target.value) / 100 })}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Data management */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Data</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex-1 px-3 py-2 bg-surface rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Export Progress
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-3 py-2 bg-surface rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Import Progress
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            {progress.sessions.length} sessions saved locally
          </p>
        </div>
      </div>
    </div>
  )
}
