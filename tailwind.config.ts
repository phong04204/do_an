import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50:  "#f0f4ff",
          100: "#e0e8ff",
          200: "#8b9ab5",
          300: "#4a5568",
          400: "#2d3748",
          500: "#1e2a3a",
          600: "#141920",
          700: "#0f1318",
          800: "#0a0d10",
          900: "#060810",
        },
        accent: {
          blue:   "#3b82f6",
          "blue-bright": "#60a5fa",
          purple: "#7c3aed",
          cyan:   "#06b6d4",
          gold:   "#f59e0b",
        },
        rank: {
          iron:      "#6b7280",
          bronze:    "#b45309",
          silver:    "#94a3b8",
          gold:      "#d97706",
          platinum:  "#06b6d4",
          diamond:   "#818cf8",
          master:    "#a855f7",
          grandmaster: "#ef4444",
          challenger: "#f59e0b",
        },
      },
      fontFamily: {
        sans:     ["Inter", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(20,25,35,0.9) 0%, rgba(15,19,24,0.95) 100%)",
        "button-gradient":
          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      },
      boxShadow: {
        "glow-blue":   "0 0 20px rgba(59,130,246,0.3)",
        "glow-purple": "0 0 20px rgba(124,58,237,0.3)",
        "glow-cyan":   "0 0 20px rgba(6,182,212,0.3)",
        "card":        "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover":  "0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.15)",
        "navbar":      "0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.07)",
        active: "rgba(59,130,246,0.5)",
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.5s ease forwards",
        "fade-in":     "fadeIn 0.4s ease forwards",
        "float":       "float 3s ease-in-out infinite",
        "pulse-glow":  "pulse-glow 2s ease-in-out infinite",
        "shimmer":     "shimmer 1.5s infinite",
        "spin-slow":   "spin 3s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(59,130,246,0.3)" },
          "50%":      { boxShadow: "0 0 25px rgba(59,130,246,0.6)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
