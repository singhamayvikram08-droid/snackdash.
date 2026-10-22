/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ededed",
        terminal: {
          bg: "#0d0d0d",
          header: "#1a1a1a",
          green: "#4ade80",
          blue: "#60a5fa",
          red: "#f87171",
          gold: "#fbbf24",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
