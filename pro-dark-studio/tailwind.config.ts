import type { Config } from "tailwindcss";

function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue?: number }) => {
    if (opacityValue !== undefined) {
      return `hsla(var(${variableName}), ${opacityValue})`;
    }
    return `hsl(var(${variableName}))`;
  };
}

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
        bg: withOpacity("--bg"),
        panel: withOpacity("--panel"),
        "panel-2": withOpacity("--panel-2"),
        stroke: withOpacity("--stroke"),
        text: withOpacity("--text"),
        muted: withOpacity("--muted"),
        subtle: withOpacity("--subtle"),
        accent: withOpacity("--accent"),
        warn: withOpacity("--warn"),
        info: withOpacity("--info"),
        danger: withOpacity("--danger"),
        "node-trigger": withOpacity("--node-trigger"),
        "node-condition": withOpacity("--node-condition"),
        "node-action": withOpacity("--node-action"),
        "node-end": withOpacity("--node-end"),
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
