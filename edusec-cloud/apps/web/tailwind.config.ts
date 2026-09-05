import type { Config } from "tailwindcss";

/**
 * EduSec Cloud design tokens (brief Section 3: "modern SaaS interface").
 * Kept intentionally small for this foundation scaffold — extend as more
 * screens land, but resist growing this into an unmanaged pile of one-off
 * colors; every new token should earn its place.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F3864", // navy — primary actions, headers
          light: "#2E4E86",
          dark: "#152847",
        },
        accent: {
          DEFAULT: "#0E7C7B", // teal — secondary actions, active nav
          light: "#14A3A1",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5F7FA",
          border: "#E2E8F0",
        },
        status: {
          success: "#1E8E5A",
          warning: "#B7791F",
          danger: "#C53030",
          info: "#2B6CB0",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
