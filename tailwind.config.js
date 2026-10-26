/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#173f7a',
          50: '#eef4fb',
          100: '#d6e4f4',
          200: '#a8c4e6',
          300: '#7aa4d8',
          400: '#4d84ca',
          500: '#2a5fa6',
          600: '#173f7a',
          700: '#122f5d',
          800: '#0d2244',
          900: '#08162b',
        },
        teal: {
          DEFAULT: '#168c8c',
          50: '#e6f5f5',
          100: '#c8e9e9',
          200: '#91d3d3',
          300: '#5abdbe',
          400: '#34a8a8',
          500: '#168c8c',
          600: '#116e6e',
          700: '#0d5454',
          800: '#093b3b',
          900: '#052323',
        },
        gold: {
          DEFAULT: '#f4b942',
          50: '#fdf6e6',
          100: '#faecd0',
          200: '#f5d99e',
          300: '#f0c66c',
          400: '#f4b942',
          500: '#e0a020',
          600: '#b07c19',
          700: '#805913',
          800: '#50370c',
          900: '#201604',
        },
        base: {
          DEFAULT: '#f5f8fc',
          50: '#fafcff',
          100: '#f5f8fc',
          200: '#e9f0f8',
          300: '#d6e3f0',
          400: '#b3c8de',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(23, 63, 122, 0.06), 0 4px 16px rgba(23, 63, 122, 0.04)',
        cardHover: '0 4px 12px rgba(23, 63, 122, 0.1), 0 12px 32px rgba(23, 63, 122, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
