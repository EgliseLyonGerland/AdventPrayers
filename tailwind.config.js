const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@headlessui/tailwindcss")({ prefix: "ui" }),
    require("daisyui"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".flex-center": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        ".inline-flex-center": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });
    }),
  ],
  daisyui: {
    themes: ["synthwave"],
  },
};
