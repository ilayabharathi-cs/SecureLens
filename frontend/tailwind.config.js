/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070a13",
          card: "rgba(13, 17, 29, 0.75)",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          purple: "#a855f7",
          red: "#ef4444",
          green: "#10b981",
          orange: "#f59e0b",
          slate: "#94a3b8",
          border: "rgba(6, 182, 212, 0.15)",
          borderHover: "rgba(6, 182, 212, 0.4)",
        }
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      boxShadow: {
        cyan: "0 0 15px rgba(6, 182, 212, 0.25)",
        cyanGlow: "0 0 25px rgba(6, 182, 212, 0.4)",
        purpleGlow: "0 0 25px rgba(168, 85, 247, 0.4)",
        blueGlow: "0 0 25px rgba(59, 130, 246, 0.4)",
      }
    },
  },
  plugins: [],
}
