import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Toggle dark mode via the `.dark` class on <html>
  darkMode: 'class',
  theme: {
    extend: {
      // All game colors read CSS custom properties defined in globals.css.
      // Switching dark/light = swapping the CSS var values under .dark/.
      // Tailwind opacity modifiers (e.g. bg-game-card/80) work because
      // the format is `rgb(var(--game-*) / <alpha-value>)`.
      colors: {
        game: {
          bg:           'rgb(var(--game-bg)           / <alpha-value>)',
          surface:      'rgb(var(--game-surface)      / <alpha-value>)',
          card:         'rgb(var(--game-card)         / <alpha-value>)',
          border:       'rgb(var(--game-border)       / <alpha-value>)',
          accent:       'rgb(var(--game-accent)       / <alpha-value>)',
          'accent-hover':'rgb(var(--game-accent-hover)/ <alpha-value>)',
          success:      'rgb(var(--game-success)      / <alpha-value>)',
          error:        'rgb(var(--game-error)        / <alpha-value>)',
          warning:      'rgb(var(--game-warning)      / <alpha-value>)',
          text:         'rgb(var(--game-text)         / <alpha-value>)',
          muted:        'rgb(var(--game-muted)        / <alpha-value>)',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'bounce-in':  'bounceIn 0.4s ease-out',
        shake:        'shake 0.4s ease-in-out',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'scale-in':   'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-3px)' },
          '80%':      { transform: 'translateX(3px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(99,102,241,0.8)' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
