'use client'

import { useState, useMemo } from 'react'
import { checkCoverage, getMissingSummary, MIN_WORDS_FOR_EVALUATION } from '@/lib/characterCoverage'

interface TextInputProps {
  onSubmit: (text: string) => void
  currentText?: string
}

// Sample texts for quick start
// evaluationReady: true means text has all required characters for graduation
// evaluationReady: false means practice-only (missing some characters)

interface SampleText {
  title: string
  text: string
  evaluationReady: boolean
  language?: 'en' | 'es'
  source?: string
}

const SAMPLE_TEXTS: SampleText[] = [
  // === EVALUATION-READY (English) ===
  {
    title: 'Wizard Problems',
    evaluationReady: true,
    text: `"Excuse me," said the wizard, adjusting his 47 scarves, "but your dragon just ate my homework." The dragon burped; 3 pages of calculus floated out. "That's only 12% of it!" Professor Quirx was furious - his beard (6 feet long) quivered with rage. "I've been teaching for 890 years, and this is the 5th time today!" The wizard shrugged. "Can't you just... un-eat it?" The dragon looked offended. "I don't do refunds," it grumbled. Somewhere, a clock struck 13:00. Nobody questioned it.`,
  },
  {
    title: 'Suspicious Cats',
    evaluationReady: true,
    text: `My cat has been acting weird lately. Yesterday at 4:30 AM, I caught him reading the newspaper (business section). "What?" he said - yes, SAID. "I'm checking my investments." Turns out he's been day-trading since 2019; his portfolio is up 340%. "You could've told me," I muttered. He just licked his paw. "You wouldn't understand. You still use a savings account." The audacity! I've been feeding this judgmental creature for 7 years. "By the way," he added, "we're out of the fancy tuna. The $28 kind." Unbelievable.`,
  },
  {
    title: 'Time Travel Oops',
    evaluationReady: true,
    text: `So I accidentally invented time travel (don't ask). First trip: 1847. Immediately stepped on a butterfly. "That's probably fine," I thought - wrong! Came back to find everyone speaks in rhymes now. Second attempt: jumped to 2089. Robots have feelings; one cried when I bumped into him. "Watch it!" he sobbed. Third try: ended up at my own birth (awkward). My mom looked at baby-me and said, "This one's gonna cause problems." She wasn't wrong. Currently stuck in 1963; the WiFi here is terrible. Send help?`,
  },
  {
    title: 'Ghost Roommate',
    evaluationReady: true,
    text: `Living with a ghost isn't bad - mostly. Gerald (died 1847) pays rent on time: $0, but he does the dishes. "Fair exchange," he says, floating through walls at 3 AM. The issues? He keeps rearranging furniture "to improve energy flow." My couch has moved 12 times this month! Also, he's brutally honest. "That outfit? 2 out of 10." Thanks, Gerald. Yesterday he invited 50 ghost friends over. "It's a seance," he explained. "You're not invited; it's rude to bring the living." I ordered pizza anyway. They judged me silently.`,
  },
  {
    title: 'Pokemon Fanfic',
    evaluationReady: true,
    text: `"Pikachu, I need you to file my taxes," Ash whispered at 2:47 AM. The electric mouse stared back, exhausted. "Pika?" Ash had been a trainer for 26 years now - still 10 years old (don't ask). His Pokedex showed 897 Pokemon caught; his bank account showed $3.50. "We've beaten every gym," he muttered, "but I can't afford rent." Brock called yesterday: "I'm a doctor now. Real job." Misty? "Marine biologist. Great benefits!" Meanwhile, Ash was sleeping in tall grass, hoping for rare encounters. "This is fine," he said. Pikachu disagreed.`,
  },
  {
    title: 'Niche Video Games',
    evaluationReady: true,
    text: `"Spreadsheet Simulator 2024" just dropped - finally! You play as an accountant (named Greg) who must balance 87 quarterly reports before 5:00 PM. Critics are calling it "aggressively boring" and "why does this exist?" I've logged 340 hours. The sequel, "Tax Form Turbo," adds a romance subplot; you can date the fax machine. My favorite? "Waiting Room Extreme" - you sit in a DMV for 6 real-time hours. No saves. One bathroom break allowed. "Is this even a game?" asked my friend. "It's art," I replied, adjusting my ergonomic chair. He left.`,
  },
  {
    title: 'Yo-Yo Extremists',
    evaluationReady: true,
    text: `"You're holding it wrong." Derek's eye twitched. He'd been yo-yoing for 23 years; this kid was maybe 14. "I've won 7 national championships," Derek hissed. "That's a basic sleeper - everyone knows you need 38 degrees of wrist tilt!" The judges exchanged looks. "Sir, this is a children's competition." Derek didn't care. His custom yo-yo (titanium core, hand-carved, $2,500) spun at exactly 4,890 RPM. "Amateurs," he muttered. His wife had left him; his kids didn't call. But when that yo-yo hit a perfect "around the world?" Worth it. Probably.`,
  },
  {
    title: 'Birds of Latin America',
    evaluationReady: true,
    text: `The Quetzal doesn't care about your problems. With its 26-inch tail feathers (excessive, honestly) and "I'm better than you" attitude, it just sits there, being gorgeous. Meanwhile, the Horned Screamer - yes, that's real - looks like a turkey had an existential crisis. "Why am I called this?" it probably wonders at 4:30 AM while screaming. The Jabiru stork stands 5 feet tall; its name means "swollen neck" (rude). And the Oilbird? Lives in caves, eats fruit, navigates by echolocation. Scientists asked: "But why?" The Oilbird offered no comment.`,
  },
  
  // === PRACTICE ONLY (Spanish) ===
  {
    title: 'Don Quijote',
    evaluationReady: false,
    language: 'es',
    source: 'Miguel de Cervantes, 1605',
    text: `En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.`,
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
        
        {/* Sample texts - Evaluation Ready */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm text-zinc-500">Evaluation-ready</p>
            <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded">
              ✓ Counts toward graduation
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_TEXTS.filter(s => s.evaluationReady).map((sample) => (
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
        
        {/* Sample texts - Practice Only */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm text-zinc-500">Practice only</p>
            <span className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded">
              Good practice, doesn't count for graduation
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_TEXTS.filter(s => !s.evaluationReady).map((sample) => (
              <button
                key={sample.title}
                onClick={() => handleSampleSelect(sample.text)}
                className="text-left p-3 bg-surface rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-300">
                    {sample.title}
                  </span>
                  {sample.language === 'es' && (
                    <span className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                      ES
                    </span>
                  )}
                </div>
                {sample.source && (
                  <div className="text-xs text-zinc-600 mb-1">{sample.source}</div>
                )}
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
