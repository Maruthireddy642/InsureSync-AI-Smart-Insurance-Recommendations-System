/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1E33",
          light: "#1B3050",
        },
        paper: "#F6F5F1",
        ledger: {
          DEFAULT: "#0F6B5C",
          light: "#E7F2EF",
          dark: "#093F36",
          glow: "#17967F",
        },
        signal: {
          DEFAULT: "#DB9A2C",
          light: "#FBF0DC",
        },
        risk: {
          DEFAULT: "#C85A46",
          light: "#FBE9E5",
        },
        slate: {
          DEFAULT: "#5B6B73",
          light: "#93A0A6",
        },
        line: "#E2E6E1",
        gold: "#C9A15A",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,30,51,0.04), 0 8px 24px -12px rgba(14,30,51,0.12)",
        lift: "0 4px 8px rgba(14,30,51,0.06), 0 16px 32px -16px rgba(14,30,51,0.18)",
        glow: "0 0 0 1px rgba(23,150,127,0.25), 0 8px 24px -8px rgba(23,150,127,0.35)",
      },
      backgroundImage: {
        "sidebar-glow": "radial-gradient(60% 50% at 15% 0%, rgba(23,150,127,0.35) 0%, rgba(23,150,127,0) 60%)",
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
