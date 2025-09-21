/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        meesho: {
          primary: '#b282a4',
          secondary: '#f43397',
          light: '#fce5f3',
          dark: '#333333',
          gray: '#f9f9f9',
          border: '#e5e5e5',
          success: '#23bb75',
          error: '#ff5722'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
        heading: ['Inter', 'Roboto', 'Arial', 'sans-serif']
      },
      boxShadow: {
        'meesho': '0 1px 8px rgba(0, 0, 0, 0.1)',
        'meesho-lg': '0 4px 12px rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [],
};