import { useNavigate } from "@remix-run/react";
import { Variants, motion } from "framer-motion";

import { Wrapper } from "~/components/register/wrapper";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "anticipate", duration: 2 },
  },
};

function RegisterIndex() {
  const navigate = useNavigate();

  return (
    <Wrapper className="overflow-y-scroll">
      <motion.div
        animate="show"
        className="flex flex-col items-center gap-12"
        initial="hidden"
        transition={{ staggerChildren: 0.1 }}
      >
        <div className="my-auto max-w-2xl space-y-8 text-center text-lg leading-relaxed wrap-balance md:text-xl">
          <motion.div variants={itemVariants}>
            L‘opération “En Avent la prière“ est une occasion pour toi de porter
            dans tes prières un frère ou une soeur de l‘église en particulier
            pendant toute la période de l‘Avent.
          </motion.div>
          <motion.div variants={itemVariants}>
            En t‘inscrivant, tu recevras le nom d‘un autre participant à
            l‘opération pour lequel tu t‘engageras à prier quotidiennement du XX
            décembre au 24 décembre à minuit et sans jamais te dévoiler à lui
            🤫.
          </motion.div>
          <motion.div variants={itemVariants}>
            Ce n‘est qu‘à partir du 25 décembre que tu pourras te faire
            connâitre à la personne en lui offrant si possible un petit cadeau
            en fonction des tes moyens 🎁.
          </motion.div>
          <motion.div variants={itemVariants}>
            Alors intéressé ? N‘hésite plus et inscris-toi !
          </motion.div>
        </div>

        <motion.button
          className="btn btn-secondary btn-outline btn-lg w-full max-w-md shadow-lg"
          onClick={() => navigate("/register")}
          variants={itemVariants}
        >
          Je m‘inscris
        </motion.button>
      </motion.div>
    </Wrapper>
  );
}

export default RegisterIndex;
