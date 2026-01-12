# Typing Course

A typing practice app designed for software engineers who need to unlearn bad habits and build proper muscle memory.

## Philosophy

- **No gates, no progression locks** — All keys available from day one
- **No WPM requirements** — Stats shown as information, not pass/fail criteria
- **Custom text input** — Practice on content you actually need to read
- **Per-character analytics** — See exactly where you struggle
- **Sound feedback** — Satisfying keystrokes make practice less of a chore

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing.

## Features

### Phase 1 (Current)
- ✅ Core typing area with character-by-character feedback
- ✅ Custom text input (paste any content)
- ✅ Sample texts for quick start
- ✅ Per-character and bigram accuracy tracking
- ✅ localStorage persistence
- ✅ Sound feedback (keystroke sounds, error tones)
- ✅ Session stats with weakest characters

### Planned
- Keyboard heatmap visualization
- Adaptive practice mode (emphasize weak spots)
- Finger placement reference guide
- Export/import progress
- Custom sounds

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Jotai (state management)
- Web Audio API (sound feedback)

## Design Decisions

**Why prose-focused?** Modern developers use AI tools (Cursor, Copilot) for code generation. The typing gap is in prose — emails, documentation, Slack messages.

**Why no progression system?** If you're already typing 40+ hours/week, you use all keys daily. A course that takes weeks to "unlock" the semicolon is useless.

**Why informational feedback instead of gates?** WPM/accuracy requirements pressure users to fall back on comfortable (bad) habits to pass. Showing stats without judgment lets you focus on improvement.
