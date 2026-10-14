/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dav: {
          navy: {
            DEFAULT: '#0f2942',
            light: '#1d3e63',
            dark: '#091827',
          },
          saffron: {
            DEFAULT: '#ea580c', // restrained Vedic saffron/orange
            light: '#f97316',
            hover: '#c2410c',
            subtle: '#fff7ed',
          },
          gold: '#d97706',
          surface: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
