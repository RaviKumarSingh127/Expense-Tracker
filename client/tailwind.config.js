/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#13131A",
        border: "#1E1E2E",
        primary: "#7C3AED",
        "primary-hover": "#6D28D9",
        accent: "#06D6A0",
        danger: "#EF4444",
        warning: "#F59E0B",
        "text-primary": "#F1F0FF",
        "text-muted": "#6B7280",
        "surface-2": "#1A1A27",
      },
      fontFamily: {
        display: ["Clash Display", "Inter", "sans-serif"],
        body: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      backdropBlur: { xs: "4px" },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(16px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        pulseSoft: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(124,58,237,0.3)",
        "glow-accent": "0 0 20px rgba(6,214,160,0.3)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
