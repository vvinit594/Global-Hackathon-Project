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
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      colors: {
        // FORGE / SIGNAL Color System
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          secondary: "var(--surface-secondary)",
          elevated: "var(--surface-elevated)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          muted: "var(--muted)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        warning: "var(--warning)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },

        // Contextual & legacy semantic mappings
        bg: {
          main: "var(--background)",
          secondary: "var(--surface-secondary)",
          sidebar: "var(--surface)",
        },
        txt: {
          primary: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          muted: "var(--muted)",
        },
        state: {
          success: "var(--accent)",
          warning: "var(--warning)",
          error: "var(--color-state-error)",
        },
        canvas: "var(--background)",
        card: "var(--surface)",
        line: "var(--border)",
        ink: {
          DEFAULT: "var(--foreground)",
          soft: "var(--foreground-secondary)",
        },
        sage: {
          DEFAULT: "var(--accent)",
          deep: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        beige: {
          DEFAULT: "var(--primary)",
          soft: "var(--primary-soft)",
        },
        danger: {
          DEFAULT: "var(--color-state-error)",
          soft: "var(--badge-danger-bg)",
        },
        "warn-soft": "var(--badge-warn-bg)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        control: "6px",
        input: "8px",
        card: "12px",
        panel: "16px",
        feature: "20px",
      },
      boxShadow: {
        subtle: "var(--color-card-shadow)",
        card: "var(--color-card-shadow)",
        pop: "var(--color-modal-shadow)",
        copper: "0 0 16px rgba(182, 83, 60, 0.22)",
        teal: "0 0 16px rgba(60, 119, 115, 0.22)",
      },
    },
  },
  plugins: [],
};
export default config;
