'use client'

import { useState, useMemo } from 'react'
import { checkCoverage, getMissingSummary, MIN_WORDS_FOR_EVALUATION } from '@/lib/characterCoverage'

interface TextInputProps {
  onSubmit: (text: string) => void
  currentText?: string
}

// Sample texts for quick start
// Each text is designed to include ALL evaluation characters:
// - All 26 letters (a-z)
// - Numbers (0-9)
// - Punctuation: . , ; : ' " ! ? - ( )
// Minimum ~120 words for reliable WPM measurement

const SAMPLE_TEXTS = [
  {
    title: 'Meeting Recap',
    text: `Yesterday's 3:30 meeting covered 5 major topics. "We need to finalize the Q4 budget," said Alex, "before the October 17th deadline." The team discussed: pricing (up 12%), timeline adjustments, and vendor contracts. Quick summary - we're expecting 80-90% completion by week 6. Jane asked, "Can we reallocate 2 or 3 engineers?" Everyone agreed; the next sync is Friday at 4:00. Don't forget to review the 28-page document! Zach will summarize the key points for executives who couldn't join.`,
  },
  {
    title: 'Project Update',
    text: `The "Phoenix" project hit a major milestone today! We've completed 7 of 9 core features (about 78%). Outstanding items: authentication fixes, data export, and the dashboard redesign. Quick wins - we shipped 24 bug fixes last week. "This is exactly the progress we needed," noted the PM. Timeline check: launch is scheduled for January 15th, 2025. Risks? Only 1 or 2 blockers remain; both are being addressed. The QA team reviewed 360 test cases - zero critical issues found. Next steps: finalize documentation, prep the demo environment.`,
  },
  {
    title: 'Feedback Request',
    text: `Hi team - I'd love your thoughts on the new design proposal (v3.2). The key changes are: simplified navigation, 40% fewer clicks to complete tasks, and a refreshed color palette. "Why the big overhaul?" you might ask. User research from August showed that 67% of customers found the old flow confusing. We've addressed this with 5 specific improvements. Questions to consider: Does the layout feel intuitive? Are the 12 new icons clear enough? Please share feedback by Thursday, 9:00 AM. Thanks - your input is extremely valuable!`,
  },
  {
    title: 'Quick Brainstorm',
    text: `Jotting down ideas for the Q1 hackathon (January 20-24). Theme options: "Build something you'd actually use," or maybe "Fix our biggest pain point." Last year's winners created a dashboard that saved 30+ hours per month - amazing! This time, let's aim for 50 participants across 8-10 teams. Prize ideas: extra PTO days (2-3), gift cards ($250 each), or "executive for a day" experiences. Logistics question - should we book the 6th floor conference room? It fits 75 people comfortably. Excited to hear everyone's suggestions; drop them in the shared doc!`,
  },
]

export default function TextInput({ onSubmit, currentText }: TextInputProps) {
  const [customText, setCustomText] = useState('')
  const [isExpanded, setIsExpanded] = useState(!currentText)
  
  // Check coverage for custom text
  const coverage = useMemo(() => {
    if (customText.trim().length === 0) return null
    return checkCoverage(customText)
  }, [customText])
  
  const missingItems = useMemo(() => {
    if (!coverage) return []
    return getMissingSummary(coverage)
  }, [coverage])
  
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
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm text-zinc-500">Quick start with a sample</p>
            <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded">
              ✓ All evaluation-ready
            </span>
          </div>
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
          {/* Coverage feedback */}
          {coverage && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              coverage.isComplete 
                ? 'bg-green-950/30 border border-green-800/30' 
                : 'bg-amber-950/30 border border-amber-800/30'
            }`}>
              {coverage.isComplete ? (
                <div className="flex items-center gap-2 text-green-400">
                  <span>✓</span>
                  <span>Evaluation-ready ({coverage.wordCount} words, all characters covered)</span>
                </div>
              ) : (
                <div className="text-amber-400">
                  <div className="flex items-center gap-2 mb-1">
                    <span>⚠</span>
                    <span>Not evaluation-ready ({coverage.wordCount}/{MIN_WORDS_FOR_EVALUATION} words, {coverage.percentComplete}% chars)</span>
                  </div>
                  {missingItems.length > 0 && (
                    <ul className="text-xs text-amber-500/80 ml-5 space-y-0.5">
                      {missingItems.slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          
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
