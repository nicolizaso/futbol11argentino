/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0D1B2A',
        gold: '#A67C00',
        slate: '#1e2a38',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        display: ['Anton', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
