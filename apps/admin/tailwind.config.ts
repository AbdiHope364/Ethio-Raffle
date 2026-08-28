import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        eth: {
          green: "#009A44",
          yellow: "#FEDD00",
          red: "#EF3340",
          blue: "#0F4C81",
        },
        admin: {
          dark: "#0b1120",
          card: "#111827",
          border: "#1f2937",
        },
      },
    },
  },
  plugins: [],
};
export default config;

