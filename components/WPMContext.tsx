'use client'

interface WPMContextProps {
  wpm: number
}

// Common typing tasks for engineers who use AI tools
const TYPING_TASKS = [
  { name: 'Quick Slack message', words: 20, icon: '💬' },
  { name: 'Short AI prompt', words: 40, icon: '🤖' },
  { name: 'Code review comment', words: 50, icon: '👀' },
  { name: 'Detailed AI prompt', words: 100, icon: '✨' },
  { name: 'Slack thread (few paragraphs)', words: 150, icon: '🧵' },
  { name: 'Quick design sketch', words: 250, icon: '📝' },
]

function formatTime(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} sec`
  } else if (minutes < 60) {
    const mins = Math.floor(minutes)
    const secs = Math.round((minutes - mins) * 60)
    if (secs === 0) return `${mins} min`
    return `${mins}m ${secs}s`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }
}

export default function WPMContext({ wpm }: WPMContextProps) {
  if (wpm <= 0) return null
  
  return (
    <div className="bg-surface-raised rounded-xl p-5 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">What {wpm} WPM means for you</h3>
        <span className="text-2xl font-bold text-accent">{wpm} WPM</span>
      </div>
      
      <div className="space-y-2">
        {TYPING_TASKS.map((task) => {
          const minutes = task.words / wpm
          return (
            <div key={task.name} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{task.icon}</span>
                <span className="text-sm text-zinc-400">{task.name}</span>
                <span className="text-xs text-zinc-600">({task.words} words)</span>
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {formatTime(minutes)}
              </span>
            </div>
          )
        })}
      </div>
      
      <p className="mt-4 text-xs text-zinc-500">
        Pure typing time only — thinking, editing, and context-switching add more.
      </p>
    </div>
  )
}
