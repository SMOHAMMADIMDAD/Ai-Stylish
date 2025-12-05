/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add this line to enable class-based dark mode
  darkMode: 'class',

  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};