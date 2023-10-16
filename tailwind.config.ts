import headlessui from "@headlessui/tailwindcss";
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    headlessui({ prefix: "ui" }),
    typography,
    daisyui,
    plugin(({ addUtilities }) => {
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
    themes: ["night"],
  },
} satisfies Config;
