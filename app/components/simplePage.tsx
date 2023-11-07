import { type Variants, motion } from "framer-motion";
import { type ReactNode } from "react";

import { ensureArray } from "~/utils";

import Logo from "./logo";

interface Props {
  heading?: ReactNode;
  children: ReactNode;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 2,
    },
  },
};

export default function SimplePage({ heading, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-8 md:gap-12 md:p-12">
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-8 md:top-12"
        initial={{ y: -20, opacity: 0 }}
        transition={{ type: "tween", ease: "anticipate", duration: 2 }}
      >
        <Logo className="mx-auto h-16 md:h-[12svh]" />
      </motion.div>

      <motion.div
        animate="show"
        className="max-w-2xl space-y-6 text-center wrap-balance md:space-y-8 md:text-xl"
        initial="hidden"
        transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
      >
        {heading ? (
          <motion.div
            className="text-[1.2em] font-bold"
            variants={itemVariants}
          >
            {heading}
          </motion.div>
        ) : null}

        {ensureArray(children).map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
