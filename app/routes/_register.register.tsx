/* eslint-disable jsx-a11y/no-autofocus */
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { render } from "@react-email/render";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  type NodeOnDiskFile,
} from "@remix-run/node";
import {
  Form,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { type Variants, motion } from "framer-motion";
import { type FC, useState } from "react";
import {
  RemixFormProvider,
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import {
  type Output,
  any,
  email,
  getOutput,
  getPipeIssues,
  minLength,
  object,
  string,
} from "valibot";

import RegisteredEmail from "~/components/emails/registered";
import AgeField from "~/components/register/fields/ageField";
import BioField from "~/components/register/fields/bioField";
import EmailField from "~/components/register/fields/emailNameField";
import FirstNameField from "~/components/register/fields/firstNameField";
import GenderField from "~/components/register/fields/genderField";
import LastNameField from "~/components/register/fields/lastNameField";
import PictureField from "~/components/register/fields/pictureField";
import Recap from "~/components/register/recap";
import { Wrapper } from "~/components/register/wrapper";
import { addPlayer, getCurrentDraw } from "~/models/draw.server";
import {
  createPerson,
  getSimilarPerson,
  updatePerson,
} from "~/models/person.server";
import { sendEmail } from "~/utils/email.server";

const schema = object({
  firstName: string([minLength(1, "Tu dois bien avoir un prénom...")]),
  lastName: string([
    minLength(1, "Je ne peux pas croire que tu n'aies pas de nom..."),
  ]),
  email: string([
    minLength(1, "J’ai vraiment de ton email 🙏"),
    email("Hmm, ça ressemble pas à une adresse email ça 🤔"),
  ]),
  gender: string([minLength(1)]),
  age: string([minLength(1)]),
  bio: string(),
  picture: any([
    (input: File | undefined) => {
      if (input) {
        if (input.size > 3_000_000) {
          return getPipeIssues(
            "custom",
            `La photo ne doit pas dépasser 3 Mo (> ${Math.floor(
              input.size / 1000000,
            )})`,
            input,
          );
        }
      }

      return getOutput(input);
    },
  ]),
});

const steps = [
  "firstName",
  "lastName",
  "email",
  "gender",
  "age",
  "bio",
  "picture",
] as const;

type Step = (typeof steps)[number];

const fields: Record<Step, FC> = {
  firstName: FirstNameField,
  lastName: LastNameField,
  email: EmailField,
  gender: GenderField,
  age: AgeField,
  bio: BioField,
  picture: PictureField,
};

const defs: Record<Step, string> = {
  firstName: "C’est parti, commence par renseigner ton prénom.",
  lastName: "Super, et maintenant ton nom.",
  email:
    "J’ai également besoin de ton adresse email pour t’envoyer des messages super intéressants sur le déroulement de l’opération.\n\nGaranti sans spam ! 😉",
  gender:
    "Déjà une bonne chose de faite !\n\nTu peux désormais me dire si tu es une femme ou un homme. Ça me servira surtout à utiliser le bon genre dans les messages.",
  age: "On avance !\n\nPrécise maintenant dans quelle tranche d’âge tu te situes. Cela permettra de créer des groupes de participants spécifiques si nécessaire.",
  picture:
    "Une dernière chose. Est-ce que tu peux mettre une photo de toi ?\n\nCette étape non plus n'est pas obligatoire mais elle aidera ton prieur mystère à te reconnaître s’il ne t’a jamais vu. Sache d’ailleurs que cette information ne sera visible que par cette personne.",
  bio: "Peux-tu écrire quelques mots te concernant ?\n\nCette étape n’est pas obligatoire mais pourrait être très utile à la personne qui te portera dans ses prières si elle ne te connait pas, surtout au début de l’opération.",
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
  const draw = await getCurrentDraw();

  if (!draw || draw.drawn) {
    return redirect("/");
  }

  const formData = await unstable_parseMultipartFormData(
    request.clone(),
    unstable_createFileUploadHandler({
      directory: process.env.UPLOADS_DIR,
    }),
  );

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

  const picture = formData.get("picture") as NodeOnDiskFile | null;

  const twin = await getSimilarPerson({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    gender: data.gender,
  });

  const person = twin
    ? await updatePerson({
        id: twin.id,
        ...data,
        ...(picture ? { picture: picture.name } : null),
      })
    : await createPerson({
        ...data,
        picture: picture?.name || null,
        exclude: [],
      });

  await addPlayer({ id: person.id, age: person.age, year: draw.year });

  await sendEmail({
    body: render(<RegisteredEmail person={person} />),
    subject: "Tu es inscris ✅",
    to: {
      address: data.email,
      name: data.firstName,
    },
  });

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
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const submit = useSubmit();
  const { state } = useNavigation();

  const finalStep = currentStep === steps.length;

  const form = useRemixForm<Output<typeof schema>>({
    resolver: valibotResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues: Object.fromEntries(searchParams),
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
        submit(formData, { method: "post", encType: "multipart/form-data" });
      },
      onInvalid: (errors) => {
        if (!errors[steps[currentStep]]) {
          nextStep();
        }
      },
    },
  });

  const {
    formState: { errors, isValid },
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

  const isSubmitting = state === "submitting" || state === "loading";

  return (
    <RemixFormProvider {...form}>
      <Wrapper>
        <Form
          className="h-full w-full flex-col gap-8 flex-center"
          encType="multipart/form-data"
          method="post"
          onChange={() => {
            clearErrors();
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
                Bravo, tu as presque terminé ! Il ne te reste plus qu’à vérifier
                les informations avant de valider ton inscription.
              </motion.div>
              <Recap {...getValues()} visible={finalStep} />
              <motion.div className="flex gap-2" variants={itemVariants}>
                <button
                  className="btn btn-ghost md:btn-lg"
                  disabled={isSubmitting || !isValid}
                  onClick={() => {
                    setCurrentStep(0);
                  }}
                  type="button"
                >
                  <span className="hidden md:inline">Attends, </span>je corrige
                </button>
                <button
                  className="btn btn-secondary btn-outline md:btn-lg"
                  disabled={isSubmitting || !isValid}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-dots loading-md" />
                      Let’s go!
                    </>
                  ) : (
                    <>
                      <span className="hidden md:inline">C’est tout bon, </span>
                      je m’inscris !
                    </>
                  )}
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
                      {errors[step]?.message?.toString()}
                    </div>
                  ) : null}

                  {defs[step] ? (
                    <motion.div
                      animate={variant}
                      className="z-10 my-auto space-y-8 whitespace-pre-wrap text-center text-[3svh] leading-tight text-base-content/80 wrap-balance md:text-[2.8svh] md:leading-normal"
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
                      {defs[step].split("\n\n").map((part) => (
                        <div key={part}>{part}</div>
                      ))}
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
                disabled={currentStep === 0 || isSubmitting}
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
                disabled={isSubmitting}
                type="submit"
              >
                <ArrowRightIcon className="h-8" />
              </button>
            </motion.div>
          </motion.div>
        </Form>
      </Wrapper>
    </RemixFormProvider>
  );
}
