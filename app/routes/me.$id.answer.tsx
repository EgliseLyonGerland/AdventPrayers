import { valibotResolver } from "@hookform/resolvers/valibot";
import { render } from "@react-email/render";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, NavLink, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useRef, useState } from "react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import invariant from "tiny-invariant";
import { type Output, minLength, object, string } from "valibot";

import NewAnswerEmail from "~/components/emails/newAnwser";
import TextareaInput from "~/components/register/inputs/textareaInput";
import Text from "~/components/text";
import { getPlayer } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import { getCurrentYear } from "~/utils";
import { sendEmail } from "~/utils/email.server";

const schema = object({
  message: string([minLength(1, "Un peu trop vide ce message !")]),
});

export async function action({ request, params }: ActionFunctionArgs) {
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

  const { id } = params;
  invariant(id);

  const person = await getPerson(id);
  invariant(person);

  const player = await getPlayer(getCurrentYear(), id);
  invariant(player);
  invariant(player.assignedId);

  const assignedPerson = await getPerson(player.assignedId);
  invariant(assignedPerson);

  sendEmail({
    subject: NewAnswerEmail.title,
    body: render(
      <NewAnswerEmail
        assignedPerson={assignedPerson}
        message={data.message}
        person={person}
      />,
    ),
    to: [{ address: person.email, name: person.firstName }],
  });

  return redirect("?ok=true");
}

export default function MeWrite() {
  const [searchParams] = useSearchParams();
  const confirmModalRef = useRef<HTMLDialogElement>(null);

  const originalMessage = searchParams.get("message") || "";
  const truncate = originalMessage.length > 200;

  const [originalMessageClamped, setOriginalMessageClamped] =
    useState(truncate);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useRemixForm<Output<typeof schema>>({
    mode: "onSubmit",
    resolver: valibotResolver(schema),
  });

  if (searchParams.get("ok") === "true") {
    return (
      <div className="rounded-box mx-auto w-full max-w-3xl bg-base-200 p-8 text-center md:p-12">
        <div className="mb-12 text-2xl">Message envoyé avec succès ! ✅</div>

        <NavLink className="btn btn-neutral" to="..">
          Retourner sur mon espace
        </NavLink>
      </div>
    );
  }

  return (
    <Form
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-4 md:px-12"
      onSubmit={handleSubmit}
    >
      <div className="text-center text-lg font-bold">
        Que souhaites-tu répondre à ton prieur mystère ?
      </div>

      <TextareaInput {...register("message")} />

      <div className="rounded-box border border-base-content/20 p-4 text-sm leading-normal opacity-60 md:text-base">
        <div className="mb-4 font-bold">Ce qu’il t’a écrit :</div>
        <div>
          <span
            className={clsx(
              "mr-2 inline",
              originalMessageClamped ? "line-clamp-4" : "whitespace-pre-line",
            )}
          >
            {originalMessageClamped
              ? `${originalMessage.substring(0, 200)}...`
              : originalMessage}
          </span>

          {truncate ? (
            <button
              className="link-accent link"
              onClick={() => {
                setOriginalMessageClamped(!originalMessageClamped);
              }}
              type="button"
            >
              {originalMessageClamped ? "Voir plus" : "Voir moins"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-auto space-x-4">
        <NavLink className="btn" to="..">
          Annuler
        </NavLink>
        <button
          className="btn btn-secondary btn-outline"
          disabled={!isValid}
          onClick={() => {
            confirmModalRef.current?.showModal();
          }}
          type="button"
        >
          Envoyer la réponse
        </button>
      </div>

      <dialog className="modal" ref={confirmModalRef}>
        <div className="modal-box">
          <h3 className="mb-4 text-xl font-bold md:text-2xl">
            Es-tu sûr de vouloir envoyer le message{" ?"}
          </h3>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-neutral btn-sm md:btn-md">
                <Text alt="Je corrige">Euh, attends...</Text>
              </button>
            </form>
            <button className="btn btn-outline btn-sm md:btn-md" type="submit">
              Oui, tout à fait !
            </button>
          </div>
        </div>

        <form className="modal-backdrop" method="dialog">
          <button>close</button>
        </form>
      </dialog>
    </Form>
  );
}
