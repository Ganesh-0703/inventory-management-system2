/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zepto: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#7B1FA2',
          900: '#4a0e4e',
          accent: '#FF3269',
        },
        blink: {
          yellow: '#F4C430',
          green: '#0C831F',
          darkgreen: '#085e16',
          lightgreen: '#e8f7ea',
        },
        darkstore: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          hover: '#243247',
          muted: '#64748B',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.6s ease-in-out 2',
      }
    },
  },
  plugins: [],
}
