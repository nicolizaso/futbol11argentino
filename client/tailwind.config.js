/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1b2a', // Deep Navy / Midnight Blue (Keeping 'background' for compatibility, same as background-dark)
        'background-dark': '#0d1b2a', 
        primary: '#74acdf',    // Sky Blue / Celeste
        secondary: '#ffffff',  // Pure White
        'accent-soft': '#e0f2fe', // Very light blue
        surface: '#1b263b',    // Secondary Dark (Keeping for now as it matches the navy theme)
        // Aliases for compatibility if needed, but Gold is removed
        navy: '#0d1b2a',
        lightblue: '#74acdf',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'], // Body text
        heading: ['Montserrat', 'sans-serif'], // Headings
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
