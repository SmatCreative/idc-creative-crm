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
        brand: {
          50:  "#fff0f0",
          100: "#ffd7d7",
          200: "#ffaeae",
          300: "#ff7777",
          400: "#ff3333",
          500: "#f20000",
          600: "#e10000",
          700: "#bf0000",
          800: "#9a0000",
          900: "#750000",
          950: "#420000",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
