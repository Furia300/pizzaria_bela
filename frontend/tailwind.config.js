/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tomato: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#b91c1c'
        },
        basil: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          DEFAULT: '#15803d'
        },
        gold: {
          50: '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b'
        },
        wood: {
          950: '#09090b',
          900: '#121110',
          850: '#181615',
          800: '#211f1d',
          700: '#2f2b28',
          card: '#1a1816',
          DEFAULT: '#181615'
        },
        flour: {
          DEFAULT: '#fafaf9',
          muted: '#e7e5e4'
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-tomato': '0 0 25px rgba(185, 28, 28, 0.45)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.4)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(245, 158, 11, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
