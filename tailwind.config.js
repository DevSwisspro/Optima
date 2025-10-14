/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/assets/**",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E53935',
          light: '#FF6F60',
          dark: '#C62828',
        },
        dark: {
          900: '#0A0A0F',
          800: '#1E1E2F',
          700: '#2A2A3E',
          600: '#383850',
        },
        accent: {
          green: '#00C853',
          orange: '#FB8C00',
          blue: '#2196F3',
          purple: '#9C27B0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(229, 57, 53, 0.5)',
        'glow-green': '0 0 20px rgba(0, 200, 83, 0.4)',
        'glow-soft': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(229, 57, 53, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(229, 57, 53, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
