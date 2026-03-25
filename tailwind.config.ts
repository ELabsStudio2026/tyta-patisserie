import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tyta: {
          green: "#5E7361",     // PANTONE 5615 C [cite: 134]
          darkGreen: "#2B4233", // PANTONE 553 C [cite: 148]
          pink: "#EDB2D1",      // PANTONE 0521 C [cite: 140]
          lightPink: "#F6CDD7", // PANTONE 706 C [cite: 153]
        },
      },
      fontFamily: {
        title: ["Diner Fatt", "sans-serif"],    // Primaria [cite: 116]
        body: ["Josefin", "sans-serif"],   // Secundaria [cite: 122]
      }
    },
  },
  plugins: [],
};
export default config;