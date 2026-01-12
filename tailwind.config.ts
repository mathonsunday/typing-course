import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Custom color palette - moody, focused aesthetic
        surface: {
          DEFAULT: '#0f0f12',
          raised: '#18181c',
          overlay: '#222228',
        },
        accent: {
          DEFAULT: '#6366f1',
          muted: '#4f46e5',
          bright: '#818cf8',
        },
        correct: '#22c55e',
        error: '#ef4444',
        pending: '#64748b',
      },
    },
  },
  plugins: [],
}
export default config
