import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "var(--black)",
        dark: "var(--dark)",
        gold: {
          DEFAULT: "var(--gold)",
          bright: "var(--gold-bright)",
          pale: "var(--gold-pale)",
        },
        white: "var(--white)",
        muted: "var(--text-muted)",
        "border-gold": "var(--border-gold)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        eyebrow: "0.5em",
        cta: "0.25em",
        "cta-wide": "0.3em",
      },
      fontSize: {
        eyebrow: ["10px", { lineHeight: "1", letterSpacing: "0.5em" }],
        hero: ["clamp(4.5rem, 10vw, 8.75rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
      },
      lineHeight: {
        body: "1.8",
      },
      spacing: {
        "rule-sm": "32px",
      },
      borderColor: {
        gold: "var(--border-gold)",
      },
      transitionTimingFunction: {
        "power3-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
        "power4-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
