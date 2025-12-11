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
        // UPNEXX 브랜드 컬러 (다크 테마 기반)
        brand: {
          black: "#0a0a0a",
          purple: "#8b5bff",
          blue: "#35a8ff",
          darkgray: "#1a1a1a",
          midgray: "#2a2a2a",
        },
        // 네온 효과용 컬러
        neon: {
          purple: "#a78bfa",
          blue: "#60a5fa",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
