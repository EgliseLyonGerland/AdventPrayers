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
  picture?: File;
  visible: boolean;
}

function Recap({
  firstName,
  lastName,
  email,
  gender,
  age,
  bio,
  picture,
  visible,
}: Props) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      "[data-item]",
      { opacity: Number(visible), y: visible ? 0 : 10 },
      {
        type: "tween",
        ease: "anticipate",
        duration: 1,
        delay: stagger(0.1, { startDelay: 1 }),
      },
    );
  }, [animate, visible]);

  return (
    <div
      className="w-full flex-1 overflow-auto rounded-xl bg-base-200 shadow-xl md:rounded-3xl"
      ref={scope}
    >
      <div className="flex flex-col gap-4 p-6 md:gap-12 md:p-8 md:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:gap-12">
          <div className="flex-1 opacity-0" data-item={true}>
            <div className="text-lg opacity-60 md:mb-2 md:text-xl">Prénom</div>
            <div className="text-lg md:text-xl">{firstName}</div>
          </div>
          <div className="flex-1 opacity-0" data-item={true}>
            <div className="text-lg opacity-60 md:mb-2 md:text-xl">Nom</div>
            <div className="text-lg md:text-xl">{lastName}</div>
          </div>
          <div className="flex-1 opacity-0" data-item={true}>
            <div className="text-lg opacity-60 md:mb-2 md:text-xl">
              Tranche d’âge
            </div>
            <div className="text-lg md:text-xl">{age}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-12">
          <div className="opacity-0" data-item={true}>
            <div className="text-lg opacity-60 md:mb-2 md:text-xl">
              Adresse email
            </div>
            <div className="w-full truncate text-lg md:text-xl">{email}</div>
          </div>
          <div className="opacity-0" data-item={true}>
            <div className="text-lg opacity-60 md:mb-2 md:text-xl">Genre</div>
            <div className="text-lg md:text-xl">{t(gender)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-12">
          <div className="opacity-0" data-item={true}>
            <div className="mb-2 text-lg opacity-60 md:text-xl">Photo</div>

            {picture ? (
              <img
                alt="Profile"
                className="h-32 object-contain"
                src={URL.createObjectURL(picture)}
              />
            ) : (
              <div className="aspect-square h-32 border border-base-content/20 flex-center">
                Aucune photo
              </div>
            )}
          </div>
          <div className="opacity-0" data-item={true}>
            <div className="text-lg opacity-60 md:mb-2 md:text-xl">
              Quelques mots à ton sujet
            </div>
            <div className="text-lg italic md:text-xl">
              {bio || "Rien à déclarer..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recap;
