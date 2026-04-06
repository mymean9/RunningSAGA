/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nrc-volt': '#CCFF00',
        'nrc-black': '#000000',
        'nrc-dark-grey': '#111111',
        'nrc-grey': '#222222',
      },
      fontFamily: {
        'nrc': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
