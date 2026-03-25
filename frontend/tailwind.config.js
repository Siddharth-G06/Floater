/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0066ff',
          dark: '#1e1e1e', // Dark grey for form background
          gray: '#2c2c2c', // Input box background
          textAlt: '#b3b3b3',
        }
      }
    },
  },
  plugins: [],
}
