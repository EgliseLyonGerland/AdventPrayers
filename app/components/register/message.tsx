import { type Variants, motion } from "framer-motion";
import { type ReactNode } from "react";

import { Wrapper } from "./wrapper";

interface Props {
  heading?: ReactNode;
  children: ReactNode[];
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "anticipate", duration: 2 },
  },
};

export default function Message({ heading, children }: Props) {
  return (
    <Wrapper className="mb-12 overflow-y-auto">
      <div className="flex flex-col items-center">
        <motion.div
          animate="show"
          className="max-w-2xl space-y-8 text-center text-lg leading-relaxed wrap-balance md:text-xl"
          initial="hidden"
          transition={{ staggerChildren: 0.1 }}
        >
          {heading ? (
            <motion.div
              className="text-[1.2em] font-bold"
              variants={itemVariants}
            >
              {heading}
            </motion.div>
          ) : null}

          {children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Wrapper>
  );
}
