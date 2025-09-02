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
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        bg: "hsl(var(--bg))",
        panel: "hsl(var(--panel))",
        "panel-2": "hsl(var(--panel-2))",
        stroke: "hsl(var(--stroke))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        subtle: "hsl(var(--subtle))",
        accent: "hsl(var(--accent))",
        warn: "hsl(var(--warn))",
        info: "hsl(var(--info))",
        danger: "hsl(var(--danger))",
        "node-trigger": "hsl(var(--node-trigger))",
        "node-condition": "hsl(var(--node-condition))",
        "node-action": "hsl(var(--node-action))",
        "node-end": "hsl(var(--node-end))",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        card: "var(--radius-card)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--easing)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        med: "var(--dur-med)",
        slow: "var(--dur-slow)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
            '0%': { transform: 'translateY(8px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn var(--dur-med) var(--easing)',
        slideIn: 'slideIn var(--dur-slow) var(--easing)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
