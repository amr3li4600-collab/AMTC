import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amtc: {
          navy: '#011E60',
          navyDark: '#011648',
          navyLight: '#032D8A',
          blue: '#1F95F8',
          blueHover: '#0F7EE6',
          blueLight: '#E6F2FE',
          blueDark: '#0C75D1',
        },
        cockpit: {
          canvas: '#0B1120',
          surface: '#131E38',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSolid: '#1E2B4A',
          hover: '#1A284C',
          input: '#0C1427',
          muted: '#94A3B8',
          text: '#F8FAFC',
        },
        navy: {
          DEFAULT: "#011E60",
          50: "#E6F2FE",
          100: "#C5D8F6",
          200: "#8EAFEA",
          300: "#5483DC",
          400: "#1F95F8",
          500: "#0F7EE6",
          600: "#0C75D1",
          700: "#032D8A",
          800: "#011648",
          900: "#011E60",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E4",
          100: "#F5E9BC",
          200: "#EDD98E",
          300: "#E4C860",
          400: "#D4AF37",
          500: "#C09B28",
          600: "#A38321",
          700: "#856A1B",
          800: "#665115",
          900: "#47380E",
        },
        slate: {
          DEFAULT: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "slide-up": "slideUp 0.25s ease-out forwards",
        "slide-right": "slideRight 0.25s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0.85", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0.85", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0.85", transform: "translateX(-6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0.9", transform: "scale(0.99)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(31,149,248,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(31,149,248,0)" },
        },
      },
      boxShadow: {
        "card": "0 1px 3px rgba(1,30,96,0.06), 0 1px 2px rgba(1,30,96,0.04)",
        "card-hover": "0 12px 28px -4px rgba(1,30,96,0.12), 0 4px 12px rgba(1,30,96,0.06)",
        "nav": "4px 0 24px rgba(1,30,96,0.15)",
        "executive": "0 10px 30px -10px rgba(1,30,96,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
