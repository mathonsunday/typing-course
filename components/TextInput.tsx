'use client'

import { useState } from 'react'

interface TextInputProps {
  onSubmit: (text: string) => void
  currentText?: string
}

// Sample texts for quick start
const SAMPLE_TEXTS = [
  {
    title: 'The Quick Brown Fox',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!',
  },
  {
    title: 'Programming Wisdom',
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. First, solve the problem. Then, write the code.',
  },
  {
    title: 'Design Principles',
    text: 'Simplicity is the ultimate sophistication. Good design is as little design as possible. Less, but better. Design is not just what it looks like. Design is how it works.',
  },
  {
    title: 'Common Bigrams',
    text: 'The theory that there is something in everything enables one to think about these things. Another thing that is rather interesting is the question of whether we need to have three or thirteen.',
  },
]

export default function TextInput({ onSubmit, currentText }: TextInputProps) {
  const [customText, setCustomText] = useState('')
  const [isExpanded, setIsExpanded] = useState(!currentText)
  
  const handleSubmit = () => {
    // Normalize text: collapse whitespace, remove control characters
    const text = customText
      .replace(/[\r\n\t]+/g, ' ')  // Convert newlines/tabs to spaces
      .replace(/\s+/g, ' ')         // Collapse multiple spaces
      .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Remove non-printable chars (keep basic latin + extended)
      .trim()
    
    if (text.length > 0) {
      onSubmit(text)
      setIsExpanded(false)
      setCustomText('') // Clear for next time
    }
  }
  
  const handleSampleSelect = (text: string) => {
    onSubmit(text)
    setIsExpanded(false)
  }
  
  if (!isExpanded && currentText) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Change text
      </button>
    )
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-surface-raised rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">
          Choose your practice text
        </h2>
        
        {/* Sample texts */}
        <div className="mb-6">
          <p className="text-sm text-zinc-500 mb-3">Quick start with a sample:</p>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.title}
                onClick={() => handleSampleSelect(sample.text)}
                className="text-left p-3 bg-surface rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-zinc-300 mb-1">
                  {sample.title}
                </div>
                <div className="text-xs text-zinc-500 line-clamp-2">
                  {sample.text.slice(0, 80)}...
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Custom text input */}
        <div>
          <p className="text-sm text-zinc-500 mb-3">Or paste your own text:</p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste any text here — an article, documentation, email draft, anything you want to practice typing..."
            className="w-full h-32 bg-surface rounded-lg border border-zinc-800 p-4 text-zinc-100 placeholder:text-zinc-600 resize-none focus:border-accent/50 transition-colors"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-zinc-500">
              {customText.length} characters
            </span>
            <div className="flex items-center gap-3">
              {currentText && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={customText.trim().length === 0}
                className="px-4 py-2 bg-accent hover:bg-accent-muted disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium transition-colors"
              >
                Start Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
