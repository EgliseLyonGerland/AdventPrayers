import headlessui from "@headlessui/tailwindcss";
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: "'M PLUS Rounded 1c', sans-serif",
      },
    },
  },
  plugins: [
    headlessui({ prefix: "ui" }),
    typography,
    daisyui,
    plugin(({ addUtilities, addVariant }) => {
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
        ".wrap-balance": {
          textWrap: "balance",
        },
      });

      addVariant("def", ":where(&)");
    }),
  ],
  daisyui: {
    themes: false,
    // darkTheme: "night",
  },
} satisfies Config;
