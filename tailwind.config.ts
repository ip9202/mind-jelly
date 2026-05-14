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
        // Primary colors
        primary: "#78555e",
        "on-primary": "#ffffff",
        "primary-container": "#ffd1dc",
        "on-primary-container": "#7a5761",

        // Secondary colors
        secondary: "#4b626a",
        "on-secondary": "#ffffff",
        "secondary-container": "#cee7f0",
        "on-secondary-container": "#516870",

        // Tertiary colors
        tertiary: "#5c5d6e",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#dbdbef",
        "on-tertiary-container": "#5e6070",

        // Error colors
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // Surface colors
        surface: "#fbf9f6",
        "on-surface": "#1b1c1a",
        "surface-variant": "#e4e2df",
        "on-surface-variant": "#4f4446",
        "background": "#fbf9f6",
        "on-background": "#1b1c1a",

        // Surface container variations
        "surface-container": "#efeeeb",
        "surface-container-low": "#f5f3f0",
        "surface-container-high": "#eae8e5",
        "surface-container-highest": "#e4e2df",
        "surface-container-lowest": "#ffffff",
        "surface-dim": "#dbdad7",
        "surface-bright": "#fbf9f6",

        // Inverse surface
        "inverse-surface": "#30312f",
        "inverse-on-surface": "#f2f0ed",
        "inverse-primary": "#e7bbc6",

        // Outline
        outline: "#817476",
        "outline-variant": "#d3c3c5",

        // Jelly emotion colors
        "jelly-base": "#FFD1DC",
        "jelly-anger": "#FFB3A7",
        "jelly-sad": "#AEC6CF",
        "jelly-tired": "#E6E6FA",
        "jelly-fear": "#E6E6FA",
        "jelly-disgust": "#B5D8C7",

        // Emotion background gradients
        "emotion-bg-joy-start": "#FFF0F3",
        "emotion-bg-joy-end": "#FFD1DC",
        "emotion-bg-sadness-start": "#EEF2F5",
        "emotion-bg-sadness-end": "#AEC6CF",
        "emotion-bg-anger-start": "#FFF0ED",
        "emotion-bg-anger-end": "#FFB3A7",
        "emotion-bg-fear-start": "#F0EEF5",
        "emotion-bg-fear-end": "#E6E6FA",
        "emotion-bg-disgust-start": "#EEF5EF",
        "emotion-bg-disgust-end": "#B5D8C7",

        // Background variations
        "bg-base": "#FAF8F5",

        // Fixed colors
        "primary-fixed": "#ffd9e2",
        "primary-fixed-dim": "#e7bbc6",
        "secondary-fixed": "#cee7f0",
        "secondary-fixed-dim": "#b2cad3",
        "tertiary-fixed": "#e1e1f5",
        "tertiary-fixed-dim": "#c5c5d8",

        // Text colors
        "text-primary": "#4E5968",

        // Semantic colors
        "on-primary-fixed": "#2d141c",
        "on-primary-fixed-variant": "#5e3e47",
        "on-secondary-fixed": "#061e25",
        "on-secondary-fixed-variant": "#344a52",
        "on-tertiary-fixed": "#191b29",
        "on-tertiary-fixed-variant": "#444655",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        "space-xs": "4px",
        "space-sm": "8px",
        "space-md": "16px",
        "space-lg": "24px",
        "space-xl": "32px",
        "layout-margin": "20px",
        "gutter": "12px",
      },
      fontFamily: {
        // TDS 스타일 Semantic Font Families
        "primary": ["var(--font-family-primary)"],
        "secondary": ["var(--font-family-secondary)"],
        "tertiary": ["var(--font-family-tertiary)"],
        "accent": ["var(--font-family-accent)"],
        // Legacy aliases (하위 호환)
        "h1": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "caption": ["Plus Jakarta Sans", "sans-serif"],
        "dongle": ["Dongle", "sans-serif"],
        "gowun": ["Gowun Dodum", "sans-serif"],
        "gamja": ["Gamja Flower", "cursive"],
      },
      fontSize: {
        // TDS 스타일 Typography Variants
        // Reference: TDS font-size 13~30px, line-height 23~40px
        "display": ["var(--text-display-size)", { lineHeight: "var(--text-display-line-height)", fontWeight: "var(--text-display-weight)" }],
        "title1": ["var(--text-title1-size)", { lineHeight: "var(--text-title1-line-height)", fontWeight: "var(--text-title1-weight)" }],
        "title2": ["var(--text-title2-size)", { lineHeight: "var(--text-title2-line-height)", fontWeight: "var(--text-title2-weight)" }],
        "title3": ["var(--text-title3-size)", { lineHeight: "var(--text-title3-line-height)", fontWeight: "var(--text-title3-weight)" }],
        "body1": ["var(--text-body1-size)", { lineHeight: "var(--text-body1-line-height)", fontWeight: "var(--text-body1-weight)" }],
        "body2": ["var(--text-body2-size)", { lineHeight: "var(--text-body2-line-height)", fontWeight: "var(--text-body2-weight)" }],
        "caption": ["var(--text-caption-size)", { lineHeight: "var(--text-caption-line-height)", fontWeight: "var(--text-caption-weight)" }],
        // Legacy aliases (하위 호환)
        "h1": ["24px", { lineHeight: "1.4", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        "tagline": ["24px", { lineHeight: "1.2", fontWeight: "400" }],
      },
      animation: {
        "jelly-float": "floating 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 15s ease infinite",
      },
      keyframes: {
        floating: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
