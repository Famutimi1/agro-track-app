import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1B5E20",
          "green-light": "#2E7D32",
          gold: "#F9A825",
        },
        surface: {
          light: "#ffffff",
          dark: "#1f2937",
        },
        crop: {
          rice: { bg: "#dcfce7", text: "#166534" },
          cassava: { bg: "#fef3c7", text: "#854d0e" },
          maize: { bg: "#dbeafe", text: "#1e40af" },
          yam: { bg: "#fed7aa", text: "#9a3412" },
          cocoa: { bg: "#d1fae5", text: "#065f46" },
          cashew: { bg: "#fce7f3", text: "#9d174d" },
          tomato: { bg: "#fee2e2", text: "#991b1b" },
          pepper: { bg: "#fef9c3", text: "#713f12" },
          vegetables: { bg: "#d1fae5", text: "#065f46" },
          sorghum: { bg: "#ede9fe", text: "#5b21b6" },
          wheat: { bg: "#e0f2fe", text: "#0c4a6e" },
        },
        admin: {
          bg: { light: "#f8fafc", dark: "#020617" },
          surface: { light: "#ffffff", dark: "#0f172a" },
          border: { light: "#e2e8f0", dark: "#1e293b" },
          text: { light: "#0f172a", dark: "#f8fafc" },
          muted: { light: "#64748b", dark: "#94a3b8" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
