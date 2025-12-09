/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E27FF",
        "background": "#1A1A1A",
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "8px", "lg": "8px", "xl": "8px", "full": "8px"},
    },
  },
  plugins: [
  ],
}