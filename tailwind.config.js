/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          accent: '#0d9488',
          warning: '#f59e0b',
          danger: '#dc2626',
        },
        aaic: {
          navy: '#0b192c',
          blue: '#1e3e62',
          orange: '#ff6500',
          dark: '#000000',
          gray: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scanline': 'scanline 3s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'aurora': 'aurora 18s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        scanline: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '100%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(52, 211, 153, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(251, 191, 36, 0.35)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
