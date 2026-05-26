const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        sans:    ['Inter',              ...defaultTheme.fontFamily.sans],
        mono:    ['"JetBrains Mono"',  ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        '2xs':        ['0.625rem',  { lineHeight: '1rem' }],
        'display-sm': ['1.5rem',    { lineHeight: '2rem',   fontWeight: '600' }],
        'display-md': ['2rem',      { lineHeight: '2.5rem', fontWeight: '700' }],
        'display-lg': ['2.5rem',    { lineHeight: '3rem',   fontWeight: '700' }],
        'display-xl': ['3.5rem',    { lineHeight: '4rem',   fontWeight: '700' }],
        'display-2xl':['4.5rem',    { lineHeight: '5rem',   fontWeight: '800' }],
      },
      colors: {
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0,0,0,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'countdown': 'countdown 5s linear forwards',
      },
      keyframes: {
        countdown: {
          '0%':   { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}
