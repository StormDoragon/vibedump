/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate: {
          50: "hsl(210 40% 98%)",
          100: "hsl(210 40% 96%)",
          200: "hsl(210 13% 91%)",
          300: "hsl(210 11% 85%)",
          400: "hsl(210 10% 40%)",
          500: "hsl(210 9% 31%)",
          600: "hsl(210 10% 23%)",
          700: "hsl(210 11% 15%)",
          800: "hsl(210 11% 9%)",
          900: "hsl(210 11% 4%)",
          950: "hsl(210 14% 3.6%)",
        },
      },
    },
  },
  plugins: [],
};
