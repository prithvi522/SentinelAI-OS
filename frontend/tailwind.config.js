/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg0: '#070b16',
        bg1: '#0e1630',
        cyan: '#00f5d4',
        danger: '#ff4d6d',
        warning: '#ffb703',
        lime: '#70e000',
        card: 'rgba(10, 18, 38, 0.65)',
      },

      
      boxShadow: {
        neon: '0 0 16px rgba(0, 245, 212, 0.45)',
        danger: '0 0 16px rgba(255, 77, 109, 0.45)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(0, 245, 212, 0.35)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 245, 212, 0.85)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.6s infinite',
      },
    },
  },
  plugins: [],
};