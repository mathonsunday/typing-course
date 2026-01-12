# Typing Course

A typing practice app designed for technical professionals who need to unlearn bad habits and build proper muscle memory. No gates, no pressure, no progression locks.

**[Try it live →](https://typing-course-pi.vercel.app)**

## Philosophy

- **All keys unlocked from day one** — No "unlock semicolon after 50 WPM" nonsense
- **No WPM gates** — Stats shown as information, not pass/fail criteria
- **Graduation based on confidence** — You decide when typing feels automatic enough for work
- **Encouragement over punishment** — Celebrates improvements, doesn't shame mistakes

---

## Features

### 🎯 Core Typing Experience
- **Character-by-character feedback** — Real-time highlighting of correct/incorrect input
- **Error correction required** — Must backspace to fix mistakes (impacts WPM naturally)
- **Line-by-line progression** — Text displayed in manageable chunks
- **Pause anytime** — Press `Escape` to pause mid-session, timer stops
- **Session persistence** — Go home mid-session and resume later

### 📝 Practice Texts
- **8 evaluation-ready texts** — Absurd stories (wizard problems, suspicious cats, Pokemon fanfic, yo-yo extremists...)
- **Spanish practice texts** — Don Quijote (Cervantes, 1605) + dedicated accent drill
- **Evaluation vs Practice distinction** — UI clearly shows which texts count toward graduation
- **Paste your own text** — Practice on articles, docs, emails, anything
- **Coverage validation** — Shows if custom text has all required characters
- **Spanish accent support** — Option+key shortcuts with visual finger guidance

### 🖐️ Finger Placement Guide
- **Hand diagram visualization** — Shows which finger to use for each key
- **Shift key guidance** — Highlights which shift key (left/right) for uppercase
- **Accent key guidance** — Multi-finger highlighting for Spanish characters
- **Always visible** — No need to look up external cheat sheets

### 📊 Progress Tracking
- **Recent-weighted metrics** — WPM and accuracy based on last 5 sessions (not all-time)
- **Trend indicators** — Shows ↑/↓ when you're improving or declining
- **Problem characters** — Identifies keys you struggle with recently
- **Session history** — Total sessions, characters typed

### 🎓 Graduation System
- **Self-assessment after each session** — Rate how automatic/fluid typing felt
- **5 out of 7 rolling window** — Graduate when 5 of last 7 sessions feel "Ready for work"
- **No arbitrary WPM targets** — You define what's good enough for your job
- **Forgiving** — Allows off days without losing progress

### 🎉 Encouragement
- **Celebrates improvements** — "Your speed is up 3 WPM recently!"
- **Milestone recognition** — "10 sessions completed!"
- **Personal bests** — "New personal best: 32 WPM!"
- **Confidence streaks** — "3 comfortable sessions in a row!"

### ⏱️ Daily Goal
- **Configurable time goal** — 5-60 minutes per day
- **Tracks across sessions** — Multiple short sessions count
- **Idle detection** — Timer pauses after 5 seconds of inactivity
- **Visual progress bar** — See how close you are to today's goal

### ✨ Visual Ambiance
- **8 background effects** — Geometric, Fireflies, Nebula, Starfield, and spooky options (Eyes, Shadow Cat, Shadows)
- **Adjustable intensity** — From subtle to immersive
- **Non-distracting** — Designed to make practice less boring without breaking focus

### 🔊 Sound Feedback
- **Keystroke sounds** — Satisfying audio feedback on correct keys
- **Error tones** — Subtle audio cue on mistakes
- **Volume control** — Adjust or mute entirely

### 💾 Data Management
- **Local storage** — Progress saved in browser
- **Export/Import** — Backup progress as JSON file
- **No account required** — Everything stays on your device

---

## Getting Started

### Run locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Or use the hosted version
Visit **[typing-course.vercel.app](https://typing-course-pi.vercel.app)**

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 |
| Language | TypeScript |
| State | Jotai |
| Styling | Tailwind CSS |
| Storage | localStorage |
| Sound | Web Audio API |
| Hosting | Vercel |

---

## Design Decisions

**Why prose-focused?**  
Modern developers use AI tools (Cursor, Copilot) for code generation. The typing gap is in prose — Slack messages, AI prompts, documentation, emails.

**Why no progression system?**  
If you're already typing 40+ hours/week, you use all keys daily. A course that takes weeks to "unlock" the semicolon is useless.

**Why self-assessed graduation?**  
Arbitrary WPM targets don't account for individual needs. A 30 WPM typist who feels fluid and automatic is better off than a 60 WPM typist still fighting bad habits.

**Why recent-weighted metrics?**  
All-time averages are discouraging if your early sessions were rough. Recent performance shows your *current* ability.

---

## License

MIT
