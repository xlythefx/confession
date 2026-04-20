/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      colors: {
        sunset: {
          50: '#fff7ed',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          700: '#c2410c',
        },
      },
    },
  },
  plugins: [],
};
