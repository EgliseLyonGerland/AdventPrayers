import { NavLink } from "@remix-run/react";
import { Variants, motion } from "framer-motion";

import { Wrapper } from "./_register";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "anticipate", duration: 2 },
  },
};

export default function Registered() {
  return (
    <Wrapper>
      <motion.div
        animate="show"
        className="mx-auto max-w-3xl space-y-12 text-center"
        initial="hidden"
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.h1
          className="text-2xl font-bold md:text-4xl"
          variants={itemVariants}
        >
          Te voilà inscris ! 🎉
        </motion.h1>
        <div className="space-y-8 text-xl wrap-balance md:text-2xl">
          <motion.div variants={itemVariants}>
            Tu devrais recevoir un mail de confirmation dans lequel tu trouveras
            un lien qui te permettra de te désinscrire (ce que je ne souhaite
            pas bien sûr).
          </motion.div>
          <motion.div variants={itemVariants}>
            Maintenant, tu peux quitter cette fênetre ou effectuer une nouvelle
            inscription.
          </motion.div>
        </div>
        <motion.div variants={itemVariants}>
          <NavLink
            className="btn btn-secondary btn-outline btn-lg"
            to="/register"
          >
            Nouvelle inscription
          </NavLink>
        </motion.div>
      </motion.div>
    </Wrapper>
  );
}
