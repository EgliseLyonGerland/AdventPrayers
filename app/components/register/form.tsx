import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Form, NavLink } from "@remix-run/react";
import clsx from "clsx";
import { type Variants, motion } from "framer-motion";
import { type FC, useState } from "react";
import { RemixFormProvider, useRemixForm } from "remix-hook-form";

import { type Person } from "~/models/person.server";

import AgeField from "./fields/ageField";
import BioField from "./fields/bioField";
import EmailField from "./fields/emailField";
import FirstNameField from "./fields/firstNameField";
import GenderField from "./fields/genderField";
import LastNameField from "./fields/lastNameField";
import PictureField from "./fields/pictureField";
import schema, { type Schema } from "./schema";

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
  firstName: "Ton prénom",
  lastName: "Ton nom",
  email: "Ton adresse email",
  gender: "Ton genre",
  age: "Ta tranche d’age",
  bio: "Quelques mots à ton sujet",
  picture: "Ta photo",
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

interface Props {
  person?: Person;
  onSubmit(data: Schema): void;
}

export default function PersonForm({ person, onSubmit }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useRemixForm<Schema>({
    resolver: valibotResolver(schema),
    defaultValues: person || {},
    submitHandlers: {
      onValid: (data) => {
        if (errors[steps[currentStep]]) {
          return;
        }

        if (!finalStep) {
          nextStep();
          return;
        }

        onSubmit(data);
      },
      onInvalid: (errors) => {
        if (!errors[steps[currentStep]]) {
          nextStep();
        }
      },
    },
  });

  const {
    setFocus,
    clearErrors,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const previousStep = () => {
    const newStep = Math.max(currentStep - 1, 0);
    clearErrors();
    setCurrentStep(newStep);
  };

  const nextStep = () => {
    const newStep = Math.min(currentStep + 1, steps.length - 1);
    clearErrors();
    setCurrentStep(newStep);
  };

  const finalStep = currentStep === steps.length - 1;

  return (
    <RemixFormProvider {...form}>
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
                {defs[step] || errors[step] ? (
                  <motion.div
                    animate={variant}
                    className={clsx(
                      "z-10 my-8 space-y-8 whitespace-pre-wrap text-center text-[3svh] leading-tight text-base-content/80 wrap-balance md:my-12 md:text-[min(2.8vh,theme(fontSize.3xl))] md:leading-normal",
                      errors[step] && "text-red-400",
                    )}
                    initial="incoming"
                    key={step}
                    transition={{
                      type: "tween",
                      ease: "anticipate",
                      duration: 0.5,
                      delay: 0.1,
                    }}
                    variants={variants}
                  >
                    {(errors[step]?.message?.toString() || defs[step])
                      .split("\n\n")
                      .map((part) => (
                        <div key={part}>{part}</div>
                      ))}
                  </motion.div>
                ) : null}

                <Component />
              </motion.div>
            );
          })}

          <div className="z-10 mt-auto space-y-6 md:space-y-12">
            <div className="flex items-center justify-center gap-6">
              <button
                className="btn btn-circle btn-outline md:btn-lg"
                disabled={currentStep === 0 || isSubmitting}
                onClick={previousStep}
                type="button"
              >
                <ArrowLeftIcon className="h-8 fill-white" />
              </button>
              <span className="text-xl">
                {currentStep + 1}/{steps.length}
              </span>
              <button
                className="btn btn-circle btn-outline md:btn-lg"
                disabled={finalStep || isSubmitting}
                type="submit"
              >
                <ArrowRightIcon className="h-8" />
              </button>
            </div>

            <div className="space-x-2">
              <NavLink className="btn md:btn-lg" to="..?showInfos=true">
                Annuler
              </NavLink>
              <button
                className="btn btn-secondary btn-outline md:btn-lg"
                disabled={!isValid}
                onClick={() => onSubmit(getValues())}
                type="button"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </motion.div>
      </Form>
    </RemixFormProvider>
  );
}
