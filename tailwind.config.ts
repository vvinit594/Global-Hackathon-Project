import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#fafaf8",
        card: "#ffffff",
        sage: {
          DEFAULT: "#b8c8b2",
          deep: "#8fa688",
          soft: "#eef2ec",
        },
        beige: {
          DEFAULT: "#e8dccb",
          soft: "#f6f1e8",
        },
        ink: {
          DEFAULT: "#343434",
          soft: "#6b6b66",
        },
        line: "#e8e8e5",
        danger: {
          DEFAULT: "#b4574f",
          soft: "#f6e6e3",
        },
        "warn-soft": "#f6eddc",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(52, 52, 52, 0.04), 0 4px 16px rgba(52, 52, 52, 0.04)",
        pop: "0 12px 40px rgba(52, 52, 52, 0.14)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
