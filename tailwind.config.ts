import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        focus: {
          DEFAULT: "hsl(var(--focus))",
          glow: "hsl(var(--focus-glow))",
        },
        distraction: {
          DEFAULT: "hsl(var(--distraction))",
          glow: "hsl(var(--distraction-glow))",
        },
        study: {
          DEFAULT: "hsl(var(--study))",
          glow: "hsl(var(--study-glow))",
        },
        couple: {
          DEFAULT: "hsl(var(--couple))",
          glow: "hsl(var(--couple-glow))",
        },
        partner: {
          DEFAULT: "hsl(var(--partner))",
          glow: "hsl(var(--partner-glow))",
        },
        love: {
          DEFAULT: "hsl(var(--love))",
          glow: "hsl(var(--love-glow))",
        },
        cat: {
          cream: "hsl(var(--cat-cream))",
          peach: "hsl(var(--cat-peach))",
          rose: "hsl(var(--cat-rose))",
          lavender: "hsl(var(--cat-lavender))",
          mint: "hsl(var(--cat-mint))",
          honey: "hsl(var(--cat-honey))",
          gray: "hsl(var(--cat-warm-gray))",
          nose: "hsl(var(--cat-nose))",
          fur: "hsl(var(--cat-fur))",
          whisker: "hsl(var(--cat-whisker))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
        "4xl": "calc(var(--radius) + 24px)",
        paw: "50% 50% 45% 45%",
        ear: "60% 40% 40% 60% / 60% 60% 40% 40%",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.2)" },
          "50%": { boxShadow: "0 0 35px hsl(var(--primary) / 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "breathing": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "counter": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.12)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.08)" },
          "60%": { transform: "scale(1)" },
        },
        "soft-pop": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 hsl(var(--couple) / 0.3)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 0 8px hsl(var(--couple) / 0)" },
        },
        "tail-swish": {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        "paw-bounce": {
          "0%": { transform: "scale(0.9)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "cat-blink": {
          "0%, 45%, 55%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(0.1)" },
        },
        "cat-stretch": {
          "0%": { transform: "scaleX(1) scaleY(1)" },
          "30%": { transform: "scaleX(1.15) scaleY(0.9)" },
          "60%": { transform: "scaleX(0.95) scaleY(1.1)" },
          "100%": { transform: "scaleX(1) scaleY(1)" },
        },
        "whisker-twitch": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(3deg)" },
          "75%": { transform: "rotate(-3deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "float": "float 5s ease-in-out infinite",
        "breathing": "breathing 3s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "counter": "counter 0.5s ease-out",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "soft-pop": "soft-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
        "tail-swish": "tail-swish 2s ease-in-out infinite",
        "paw-bounce": "paw-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "cat-blink": "cat-blink 4s ease-in-out infinite",
        "cat-stretch": "cat-stretch 3s ease-in-out",
        "whisker-twitch": "whisker-twitch 0.3s ease-in-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;