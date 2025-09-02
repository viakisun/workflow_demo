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
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        bg: "hsl(222 47% 11%)",
        panel: "hsl(222 47% 13%)",
        "panel-2": "hsl(222 47% 15%)",
        stroke: "hsl(222 47% 25%)",
        text: "hsl(215 25% 90%)",
        muted: "hsl(217 19% 67%)",

        interactive: "hsl(217 91% 60%)",
        "interactive-hover": "hsl(217 91% 65%)",

        "node-trigger": "hsl(217 91% 60%)",
        "node-condition": "hsl(38 92% 50%)",
        "node-action": "hsl(145 78% 40%)",
        "node-end": "hsl(215 14% 47%)",

        success: "hsl(145 78% 40%)",
        warning: "hsl(38 92% 50%)",
        danger: "hsl(0 84% 60%)",
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        'glow-sm': '0 0 8px 0px hsl(217 91% 60% / 0.2)',
        'glow-md': '0 0 16px 0px hsl(217 91% 60% / 0.2)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
