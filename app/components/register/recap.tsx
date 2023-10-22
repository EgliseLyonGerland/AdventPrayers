import { stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";

import t from "~/utils/i18n";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  age: string;
  bio: string;
  visible: boolean;
}

function Recap({
  firstName,
  lastName,
  email,
  gender,
  age,
  bio,
  visible,
}: Props) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      ".item",
      { opacity: Number(visible) },
      { delay: stagger(0.1, { startDelay: 0.5 }) },
    );
  }, [visible]);

  return (
    <div
      className="bg-neutral rounded-xl md:rounded-3xl shadow-xl flex-1 overflow-auto w-full"
      ref={scope}
    >
      <div className="p-6 md:p-8 md:px-12 flex flex-col md:gap-6 gap-4">
        <div className="flex sm:gap-20 gap-2 flex-col sm:flex-row">
          <div className="flex flex-col md:gap-6 gap-2">
            <div className="item opacity-0">
              <div className="md:text-xl text-lg md:mb-2 opacity-60">
                Prénom
              </div>
              <div className="text-xl md:text-2xl">{firstName}</div>
            </div>
            <div className="item opacity-0">
              <div className="md:text-xl text-lg md:mb-2 opacity-60">Nom</div>
              <div className="text-xl md:text-2xl">{lastName}</div>
            </div>
            <div className="item opacity-0">
              <div className="md:text-xl text-lg md:mb-2 opacity-60">
                Adresse email
              </div>
              <div className="text-xl md:text-2xl">{email}</div>
            </div>
          </div>
          <div className="flex flex-col md:gap-6 gap-4">
            <div className="item opacity-0">
              <div className="md:text-xl text-lg md:mb-2 opacity-60">Genre</div>
              <div className="text-xl md:text-2xl">{t(gender)}</div>
            </div>
            <div className="item opacity-0">
              <div className="md:text-xl text-lg md:mb-2 opacity-60">
                Tranche d‘âge
              </div>
              <div className="text-xl md:text-2xl">{age}</div>
            </div>
          </div>
        </div>
        <div className="item opacity-0">
          <div className="md:text-xl text-lg md:mb-2 opacity-60">
            Quelques mots à ton sujet
          </div>
          <div className="text-xl md:text-2xl">
            {bio || <i>Rien à déclarer...</i>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recap;
