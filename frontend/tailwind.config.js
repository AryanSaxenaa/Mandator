/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-glow': 'var(--accent-glow)',
        'bg-dark': 'var(--bg-dark)',
        'bg-panel': 'var(--bg-panel)',
        'text-main': 'var(--text-main)',
        'text-dim': 'var(--text-dim)',
        'border-tech': 'var(--border-tech)',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
