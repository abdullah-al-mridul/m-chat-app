import keepPreset from "keep-react/preset";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx}",
    "node_modules/keep-react/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  presets: [keepPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
