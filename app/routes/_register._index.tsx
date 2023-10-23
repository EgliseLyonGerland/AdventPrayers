import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";

function RegisterIndex() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-12">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="my-auto line-clamp-6 max-w-2xl text-center text-lg leading-relaxed md:line-clamp-none md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 1,
          delay: 0.5,
        }}
      >
        L‘opération “En Avent la prière“ est une occasion pour toi de porter
        dans tes prières un frère ou une soeur de l‘église en particulier
        pendant toute la période de l‘Avent.
        <br />
        <br />
        En t‘inscrivant, tu recevras le nom d‘un autre participant à l‘opération
        pour lequel tu t‘engageras à prier quotidiennement du XX décembre au 24
        décembre à minuit et sans jamais te dévoiler à lui 🤫.
        <br />
        <br />
        Ce n‘est qu‘à partir du 25 décembre que tu pourras te faire connâitre à
        la personne en lui offrant si possible un petit cadeau en fonction des
        tes moyens 🎁.
        <br />
        <br />
        Intéressé ? N‘hésite plus et inscris-toi !
      </motion.div>

      <motion.button
        animate={{ opacity: 1, y: 0 }}
        className="btn btn-secondary btn-outline btn-lg w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        onClick={() => navigate("/register")}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 1,
          delay: 0.7,
        }}
      >
        Je m‘inscris
      </motion.button>
    </div>
  );
}

export default RegisterIndex;
