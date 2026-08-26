/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        indigo: {
          DEFAULT: '#6366F1',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        dark: {
          DEFAULT: '#020617',
          50: '#0F172A',
          100: '#0A0F1E',
          200: '#060B16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #1E1B4B 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-blue': 'radial-gradient(circle at center, rgba(37,99,235,0.3) 0%, transparent 70%)',
        'glow-indigo': 'radial-gradient(circle at center, rgba(99,102,241,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(37,99,235,0.4)',
        'glow-indigo': '0 0 40px rgba(99,102,241,0.4)',
        'glow-sm': '0 0 20px rgba(37,99,235,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'beam': 'beam 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(37,99,235,0.3)' },
          '100%': { boxShadow: '0 0 60px rgba(99,102,241,0.6)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        beam: {
          '0%': { opacity: '0', transform: 'scaleX(0)' },
          '50%': { opacity: '1', transform: 'scaleX(1)' },
          '100%': { opacity: '0', transform: 'scaleX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
