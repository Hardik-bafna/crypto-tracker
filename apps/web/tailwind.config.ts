import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        surface: "#111827",
        "surface-raised": "#1f2937",
        "surface-border": "#374151",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
        warning: {
          500: "#f59e0b",
        },
        success: {
          500: "#10b981",
        },
      },
    },
  },
  plugins: [],
};

export default config;
