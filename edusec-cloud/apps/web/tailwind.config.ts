import type { Config } from "tailwindcss";

/**
 * EduSec Cloud design tokens (brief Section 3: "modern SaaS interface").
 * Kept intentionally small for this foundation scaffold — extend as more
 * screens land, but resist growing this into an unmanaged pile of one-off
 * colors; every new token should earn its place.
 *
 * Palette refreshed to a Tuwaiq-inspired identity (purple/coral, pastel
 * surfaces) — values sampled directly from tuwaiq.edu.sa's live computed
 * styles. Token *names* (brand/accent/surface/status) are unchanged so
 * every existing `bg-brand`, `text-accent`, `bg-status-success`, etc.
 * class across the app re-themes automatically from this single file.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F29B7", // purple — primary actions, headers (Tuwaiq primary)
          light: "#6635D7",
          dark: "#2C2062",
        },
        accent: {
          DEFAULT: "#FF536D", // coral — secondary actions, active nav (Tuwaiq secondary CTA)
          light: "#FD807F",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F9F7FF",
          border: "#EAECF0",
        },
        status: {
          success: "#10A400",
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
