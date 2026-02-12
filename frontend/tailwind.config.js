/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f8fa',
          100: '#daecf1',
          200: '#b7d8e1',
          300: '#89bfcd',
          400: '#67aabc',
          500: '#4a91a5',
          600: '#3e7989',
          700: '#32606c',
          800: '#264750',
          900: '#1b3137',
        },
      },
    },
  },
  plugins: [],
}
