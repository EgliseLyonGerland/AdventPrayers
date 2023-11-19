import { valibotResolver } from "@hookform/resolvers/valibot";
import { render } from "@react-email/render";
import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  NavLink,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useRef } from "react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import invariant from "tiny-invariant";
import { type Output, minLength, object, string } from "valibot";

import NewMessageEmail from "~/components/emails/newMessage";
import TextareaInput from "~/components/register/inputs/textareaInput";
import Text from "~/components/text";
import { getPlayer } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import { genderize, getCurrentYear } from "~/utils";
import { sendEmail } from "~/utils/email.server";

const schema = object({
  personId: string([minLength(1)]),
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

  const assignedPerson = await getPerson(data.personId);
  invariant(assignedPerson);

  sendEmail({
    subject: NewMessageEmail.title,
    body: render(
      <NewMessageEmail message={data.message} person={assignedPerson} />,
    ),
    to: [{ address: assignedPerson.email, name: assignedPerson.firstName }],
  });

  return redirect("?ok=true");
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  invariant(id);

  const person = await getPerson(id);
  invariant(person);

  const player = await getPlayer(getCurrentYear(), id);
  invariant(player);
  invariant(player.assignedId);

  const assignedPerson = await getPerson(player.assignedId);
  invariant(assignedPerson);

  return json({ assignedPerson });
}

export default function MeWrite() {
  const { assignedPerson } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const confirmModalRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useRemixForm<Output<typeof schema>>({
    mode: "onSubmit",
    resolver: valibotResolver(schema),
    defaultValues: {
      personId: assignedPerson.id,
    },
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
      <input type="hidden" {...register("personId")} />
      <div className="text-center text-lg font-bold">
        Que souhaites-tu dire à {assignedPerson.firstName} ?
      </div>

      <TextareaInput {...register("message")} />

      <div className="rounded-box my-auto max-w-2xl border border-warning p-4 text-center text-sm font-bold leading-normal text-warning opacity-60 md:text-base">
        Ce message sera envoyé de façon anonyme à {assignedPerson.firstName}.{" "}
        {genderize("Il", assignedPerson, "Elle")} ne s’aura donc pas que tu en
        es l’auteur. Pour préserver le secret, assure-toi de ne transmettre
        aucun indice qui pemettrait à {assignedPerson.firstName} de te
        démasquer.
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
          Envoyer le message
        </button>
      </div>

      <dialog className="modal" ref={confirmModalRef}>
        <div className="modal-box">
          <h3 className="mb-4 text-xl font-bold md:text-2xl">
            Juste pour être sûr 👀
          </h3>
          <div>
            Confirmes-tu avoir fait attention à ce que le contenu du message ne
            permette pas d’éveiller de soupçon concernant ton identité auprès de{" "}
            {assignedPerson.firstName} ?
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-neutral btn-sm md:btn-md">
                <Text alt="Je corrige">Hmm, je corrige...</Text>
              </button>
            </form>
            <button className="btn btn-outline btn-sm md:btn-md" type="submit">
              <Text alt="Je confirme">Affirmatif, je confirme !</Text>
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
