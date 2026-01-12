'use client'

import { useAtom } from 'jotai'
import { settingsAtom } from '@/stores/progress'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useAtom(settingsAtom)
  
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
          
          {/* Volume slider */}
          {settings.soundEnabled && (
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
        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            Your progress is automatically saved to your browser.
          </p>
        </div>
      </div>
    </div>
  )
}
