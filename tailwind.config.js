/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1a2233',
        gold: '#bfa14a',
        parchment: '#f5ecd7',
        ivory: '#f9f6f2',
      },
      fontFamily: {
        serif: ['Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 