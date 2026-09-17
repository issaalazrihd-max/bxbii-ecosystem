import type { Config } from "tailwindcss";

/** Shared BXBII design tokens. Keep the palette compact and reusable. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#4F29B7", light: "#6635D7", dark: "#2C2062" },
        accent: { DEFAULT: "#FF536D", light: "#FD807F" },
        surface: { DEFAULT: "#FFFFFF", subtle: "#F9F7FF", border: "#EAECF0" },
        status: { success: "#10A400", warning: "#B7791F", danger: "#C53030", info: "#2B6CB0" },
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      borderRadius: { DEFAULT: "0.5rem" },
    },
  },
  plugins: [],
};

export default config;
