/* eslint-disable jsx-a11y/no-autofocus */
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Variants, motion } from "framer-motion";
import { FC, useState } from "react";
import {
  RemixFormProvider,
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import { Output, email, minLength, object, string } from "valibot";

import AgeField from "~/components/register/fields/ageField";
import BioField from "~/components/register/fields/bioField";
import EmailField from "~/components/register/fields/emailNameField";
import FirstNameField from "~/components/register/fields/firstNameField";
import GenderField from "~/components/register/fields/genderField";
import LastNameField from "~/components/register/fields/lastNameField";
import Recap from "~/components/register/recap";
import { Wrapper } from "~/components/register/wrapper";
import { addPlayer, getCurrentDraw } from "~/models/draw.server";
import { createPerson } from "~/models/person.server";

export const meta: MetaFunction = () => [{ title: "Inscription" }];

const schema = object({
  firstName: string([minLength(1, "Tu dois bien avoir un prénom...")]),
  lastName: string([
    minLength(1, "Je ne peux pas croire que tu n'aies pas de nom..."),
  ]),
  email: string([
    minLength(1, "J‘ai vraiment de ton email 🙏"),
    email("Hmm, ça ressemble pas à une adresse email ça 🤔"),
  ]),
  gender: string([minLength(1)]),
  age: string([minLength(1)]),
  bio: string(),
});

const steps = [
  "firstName",
  "lastName",
  "email",
  "gender",
  "age",
  "bio",
] as const;

type Step = (typeof steps)[number];

const fields: Record<Step, FC> = {
  firstName: FirstNameField,
  lastName: LastNameField,
  email: EmailField,
  gender: GenderField,
  age: AgeField,
  bio: BioField,
};

const defs: Record<Step, string> = {
  firstName: "C‘est parti, commence par renseigner ton prénom.",
  lastName: "Super, et maintenant ton nom.",
  email:
    "J‘ai également besoin de ton adresse email pour t‘envoyer des messages super intéressants sur le déroulement de l‘opération.\n\nGaranti sans spam ! 😉",
  gender:
    "Déjà une bonne chose de faite !\n\nTu peux désormais me dire si tu es une femme ou un homme. Ça me servira surtout à utiliser le bon genre dans les messages.",
  age: "On avance ! Précise maintenant dans quelle tranche d‘age tu te situes. Cela permettra de créer des groupes de participants spécifiques si nécessaire.",
  bio: "Peux-tu écrire quelques mots te concernant ?\n\nCette étape n‘est pas obligatoire mais pourrait-être très utile à la personne qui te portera dans ses prières si elle ne te connait pas, surtout au début de l‘opération.",
};

const autoFocus: Partial<Record<Step, true>> = {
  firstName: true,
  lastName: true,
  email: true,
  gender: true,
  age: true,
};

const variants: Variants = {
  visible: { opacity: 1, x: 0 },
  incoming: { opacity: 0, x: 60 },
  outgoing: { opacity: 0, x: -60 },
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<Output<typeof schema>>(
    request,
    valibotResolver(schema),
  );
  if (errors) {
    return json({ errors, defaultValues });
  }

  const draw = await getCurrentDraw();

  if (!draw || draw.drawn) {
    return redirect("/");
  }

  const person = await createPerson({ ...data, exclude: [] });

  await addPlayer({ id: person.id, age: person.age, year: draw.year });

  return redirect("/registered");
};

export const loader = async () => {
  const draw = await getCurrentDraw();

  if (!draw) {
    return redirect("/");
  }

  return json({});
};

const itemVariants: Variants = {
  incoming: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "anticipate", duration: 2 },
  },
};

export default function Register() {
  const fetcher = useFetcher<Output<typeof schema>>();
  const [currentStep, setCurrentStep] = useState(0);

  const finalStep = currentStep === steps.length;

  const form = useRemixForm<Output<typeof schema>>({
    fetcher,
    resolver: valibotResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues: {
      gender: "female",
      age: "18+",
      firstName: "Nicolas",
      lastName: "Bazille",
      email: "oltodo@msn.com",
      bio: "Nulla reprehenderit pariatur magna eu aliqua aliquip dolore mollit ullamco culpa exercitation aliquip exercitation id.",
    },
    submitHandlers: {
      onValid: (data) => {
        if (errors[steps[currentStep]]) {
          return;
        }

        if (!finalStep) {
          nextStep();
          return;
        }

        const formData = createFormData(data);
        fetcher.submit(formData, { method: "post" });
      },
      onInvalid: (errors) => {
        if (!errors[steps[currentStep]]) {
          nextStep();
        }
      },
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    setFocus,
    clearErrors,
    getValues,
  } = form;

  const previousStep = () => {
    const newStep = Math.max(currentStep - 1, 0);
    clearErrors();
    setCurrentStep(newStep);
  };

  const nextStep = () => {
    const newStep = Math.min(currentStep + 1, steps.length);
    clearErrors();
    setCurrentStep(newStep);
  };

  return (
    <RemixFormProvider {...form}>
      <Wrapper>
        <fetcher.Form
          className="h-full w-full flex-col gap-8 flex-center"
          method="post"
          onChange={() => {
            clearErrors(steps[currentStep]);
          }}
          onSubmit={handleSubmit}
        >
          <motion.div
            animate={{ opacity: 1 }}
            className="relative flex w-full max-w-[700px] flex-1 items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              animate={finalStep ? "visible" : "incoming"}
              className="absolute flex h-full flex-1 flex-col items-center justify-between gap-8"
              initial={false}
              style={{ zIndex: finalStep ? 2 : 1 }}
              transition={{
                type: "tween",
                ease: "anticipate",
                duration: 0.5,
                staggerChildren: 0.2,
              }}
              variants={variants}
            >
              <motion.div
                className="text-center text-lg text-base-content/80 md:text-2xl"
                variants={itemVariants}
              >
                Bravo, tu as presque terminé ! Il ne te reste plus qu‘à vérifier
                les informations avant valider ton inscription.
              </motion.div>
              <Recap {...getValues()} visible={finalStep} />
              <motion.div className="flex gap-2" variants={itemVariants}>
                <button
                  className="btn btn-ghost md:btn-lg"
                  onClick={() => {
                    setCurrentStep(0);
                  }}
                  type="button"
                >
                  <span className="hidden md:inline">Attends, </span>je corrige
                </button>
                <button
                  className="btn btn-secondary btn-outline md:btn-lg"
                  type="submit"
                >
                  <span className="hidden md:inline">C‘est tout bon, </span>je
                  m‘inscris !
                </button>
              </motion.div>
            </motion.div>

            {steps.map((step, index) => {
              const Component = fields[step];

              const variant =
                currentStep === index
                  ? "visible"
                  : currentStep < index
                  ? "incoming"
                  : "outgoing";

              return (
                <motion.div
                  animate={variant}
                  className="absolute flex h-full w-full flex-col pb-20"
                  initial="incoming"
                  key={step}
                  onAnimationComplete={(def) => {
                    if (def === "visible" && autoFocus[step]) {
                      setFocus(step);
                    }
                  }}
                  style={{ zIndex: currentStep === index ? 2 : 1 }}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                  variants={variants}
                >
                  <div className="">
                    <Component />
                  </div>

                  {errors[step] ? (
                    <div className="m-4 text-center text-error">
                      {errors[step]?.message}
                    </div>
                  ) : null}

                  {defs[step] ? (
                    <motion.div
                      animate={variant}
                      className="z-10 my-auto whitespace-pre-wrap text-center text-xl text-base-content/80 wrap-balance md:text-3xl"
                      initial="incoming"
                      key={step}
                      transition={{
                        type: "tween",
                        ease: "anticipate",
                        duration: 0.5,
                        delay: 0.5,
                      }}
                      variants={{
                        visible: { opacity: 1, y: 0 },
                        incoming: { opacity: 0, y: 20 },
                        outgoing: { opacity: 0 },
                      }}
                    >
                      {defs[step]}
                    </motion.div>
                  ) : null}
                </motion.div>
              );
            })}

            <motion.div
              animate={{
                opacity: finalStep ? 0 : 1,
                y: finalStep ? 30 : 0,
              }}
              className="relative mt-auto flex items-center justify-center gap-6"
              initial={false}
              style={{ zIndex: finalStep ? 0 : 10 }}
              transition={{ type: "tween", ease: "anticipate", duration: 0.5 }}
            >
              <button
                className="btn btn-circle btn-outline btn-lg"
                disabled={currentStep === 0}
                onClick={previousStep}
                type="button"
              >
                <ArrowLeftIcon className="h-8 fill-white" />
              </button>
              <span className="text-xl">
                {currentStep + 1}/{steps.length + 1}
              </span>
              <button
                className="btn btn-circle btn-outline btn-lg"
                type="submit"
              >
                <ArrowRightIcon className="h-8" />
              </button>
            </motion.div>
          </motion.div>
        </fetcher.Form>
      </Wrapper>
    </RemixFormProvider>
  );
}
