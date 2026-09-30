/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#050505',
          sidebar: '#000000',
          card: '#111111',
          surface: '#181818',
          border: '#262626',
          textPrimary: '#FFFFFF',
          textMuted: '#A1A1AA',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        status: {
          present: '#22C55E',
          absent: '#EF4444',
          pending: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
