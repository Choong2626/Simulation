/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gov: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#1d4ed8",
          600: "#1e40af",
          700: "#1d3b8f",
          900: "#172554"
        },
        ink: "#172033"
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
