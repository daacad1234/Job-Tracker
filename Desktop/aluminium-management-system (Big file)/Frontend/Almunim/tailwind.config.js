/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          dark: '#1d4ed8',
        },
        secondary: '#1e293b', // slate-800
        accent: '#10b981', // emerald-500
        bg: '#f9fafb', // gray-50
      },
    },
  },
  plugins: [],
}
