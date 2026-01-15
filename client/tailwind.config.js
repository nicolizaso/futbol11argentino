/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1b2a', // Dark Navy
        primary: '#74acdf',    // Sky Blue
        accent: '#a67c00',     // Metallic Gold
        surface: '#1b263b',    // Secondary Dark
        // Retaining old colors as aliases to prevent immediate breakage,
        // but they should be replaced in the codebase eventually.
        navy: '#0d1b2a',
        gold: '#a67c00',
        slate: '#1b263b',
        lightblue: '#74acdf',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        // Old font families
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
