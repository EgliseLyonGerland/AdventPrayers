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
      "[data-item]",
      { opacity: Number(visible) },
      { delay: stagger(0.1, { startDelay: 0.5 }) },
    );
  }, [visible]);

  return (
    <div
      className="w-full flex-1 overflow-auto rounded-xl bg-neutral shadow-xl md:rounded-3xl"
      ref={scope}
    >
      <div className="flex flex-col gap-4 p-6 md:gap-6 md:p-8 md:px-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-20">
          <div className="flex flex-col gap-2 md:gap-6">
            <div className="opacity-0" data-item>
              <div className="text-lg opacity-60 md:mb-2 md:text-xl">
                Prénom
              </div>
              <div className="text-xl md:text-2xl">{firstName}</div>
            </div>
            <div className="opacity-0" data-item>
              <div className="text-lg opacity-60 md:mb-2 md:text-xl">Nom</div>
              <div className="text-xl md:text-2xl">{lastName}</div>
            </div>
            <div className="opacity-0" data-item>
              <div className="text-lg opacity-60 md:mb-2 md:text-xl">
                Adresse email
              </div>
              <div className="text-xl md:text-2xl">{email}</div>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="opacity-0" data-item>
              <div className="text-lg opacity-60 md:mb-2 md:text-xl">Genre</div>
              <div className="text-xl md:text-2xl">{t(gender)}</div>
            </div>
            <div className="opacity-0" data-item>
              <div className="text-lg opacity-60 md:mb-2 md:text-xl">
                Tranche d‘âge
              </div>
              <div className="text-xl md:text-2xl">{age}</div>
            </div>
          </div>
        </div>
        <div className="opacity-0" data-item>
          <div className="text-lg opacity-60 md:mb-2 md:text-xl">
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
