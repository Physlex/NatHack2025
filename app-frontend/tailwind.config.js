/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/lib/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0088ff',
          light: '#e6f3ff',
          dark: '#004480',
        },
        secondary: {
          DEFAULT: '#A3A3A3',
        },
        offwhite: {
          DEFAULT: '#f2f8fc',
        }
      }
    },
  },
  darkMode: "class",
  plugins: [
    require('flowbite/plugin'),
  ],
}
