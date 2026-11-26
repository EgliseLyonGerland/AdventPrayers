/* eslint-disable jsx-a11y/no-autofocus */
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { render } from "@react-email/components";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData,
  type NodeOnDiskFile,
} from "@remix-run/node";
import {
  Form,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import clsx from "clsx";
import { type Variants, motion } from "framer-motion";
import { type FC, useState } from "react";
import {
  RemixFormProvider,
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import { type Output } from "valibot";

import AdminRegistationAdded from "~/components/emails/adminRegistationAdded";
import RegistrationRecordedEmail from "~/components/emails/registrationRecorded";
import AgeField from "~/components/register/fields/ageField";
import BioField from "~/components/register/fields/bioField";
import EmailField from "~/components/register/fields/emailField";
import FirstNameField from "~/components/register/fields/firstNameField";
import GenderField from "~/components/register/fields/genderField";
import LastNameField from "~/components/register/fields/lastNameField";
import PictureField from "~/components/register/fields/pictureField";
import Recap from "~/components/register/recap";
import schema from "~/components/register/schema";
import { Wrapper } from "~/components/register/wrapper";
import { AppName } from "~/config";
import { getCurrentDraw } from "~/models/draw.server";
import { register } from "~/models/registrations.server";
import { sendEmail } from "~/utils/email.server";
import { createPictureUploadHandler } from "~/utils/picture.server";

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
  bio: "Peux-tu écrire quelques mots te concernant ?\n\nCette étape n’est pas obligatoire mais pourrait être très utile à la personne qui te portera dans ses prières si elle ne te connaît pas, surtout au début de l’opération.",
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
    createPictureUploadHandler(),
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

  const registration = await register({
    ...data,
    picture: picture?.name || null,
  });

  sendEmail({
    body: render(<RegistrationRecordedEmail registration={registration} />),
    subject: RegistrationRecordedEmail.title,
    to: [{ address: data.email, name: data.firstName }],
  });

  sendEmail({
    body: render(<AdminRegistationAdded person={registration} />),
    subject: AdminRegistationAdded.title,
    to: [{ address: "enaventlapriere@egliselyongerland.org", name: AppName }],
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
                  disabled={isSubmitting}
                  onClick={() => {
                    setCurrentStep(0);
                  }}
                  type="button"
                >
                  <span className="hidden md:inline">Attends, </span>je corrige
                </button>
                <button
                  className="btn btn-secondary btn-outline md:btn-lg"
                  disabled={isSubmitting}
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

                  {defs[step] || errors[step] ? (
                    <motion.div
                      animate={variant}
                      className={clsx(
                        "z-10 my-auto space-y-8 whitespace-pre-wrap text-center text-[3svh] leading-tight text-base-content/80 wrap-balance md:text-[min(2.8vh,theme(fontSize.3xl))] md:leading-normal",
                        errors[step] && "text-red-400",
                      )}
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
                      {(errors[step]?.message?.toString() || defs[step])
                        .split("\n\n")
                        .map((part) => (
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
