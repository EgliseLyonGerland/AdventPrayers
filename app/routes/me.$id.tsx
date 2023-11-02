import { render } from "@react-email/components";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import invariant from "tiny-invariant";

import Box from "~/components/box";
import UnregisteredEmail from "~/components/emails/unregistered";
import Logo from "~/components/logo";
import { AppNameQuoted } from "~/config";
import { deletePlayer, getCurrentDraw } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import { getCurrentYear } from "~/utils";
import { sendEmail } from "~/utils/email.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  invariant(id, "No ID provided");

  const person = await getPerson(id);

  if (!person) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const draw = await getCurrentDraw();

  invariant(draw, "Draw not found");

  const isRegistered = Boolean(
    draw.players.find((player) => player.personId === person.id),
  );

  if (!isRegistered) {
    throw new Response(null, {
      status: 404,
      statusText: "You are not registered",
    });
  }

  return json({ draw, person });
};

export const action = async ({ params }: ActionFunctionArgs) => {
  const { id } = params;
  invariant(id, "No ID provided");

  const person = await getPerson(id);

  if (!person) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const year = getCurrentYear();

  await deletePlayer({ id, year });

  if (person.email) {
    await sendEmail({
      body: render(<UnregisteredEmail person={person} />),
      subject: "Tu es désinscris 🥺",
      to: {
        address: person.email,
        name: person.firstName,
      },
    });
  }

  return redirect("/me/unregistered");
};

export default function Me() {
  const { draw, person } = useLoaderData<typeof loader>();
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="h-screen flex-col gap-8 p-8 text-lg flex-center md:text-xl">
      <Logo className="h-16 md:h-24" />

      <Box title={`👋 Hey ${person.firstName} !`}>
        <div>
          Tu es bien inscrit pour l‘édition {draw.year} de {AppNameQuoted}.
        </div>
        <div>
          L‘oépration n‘a pas encore démarré, tu peux encore te désinscrire si
          tu le souhaites.
        </div>
        <button
          className="btn btn-secondary btn-outline md:btn-lg"
          onClick={() => {
            modalRef.current?.showModal();
          }}
        >
          Me désinscrire 🥲
        </button>
      </Box>

      <dialog className="modal" ref={modalRef}>
        <div className="modal-box">
          <h3 className="mb-4 text-xl font-bold md:text-2xl">
            Tu vas beaucoup me manquer{" "}😭
          </h3>
          <div>Es-tu sûr de vouloir te désinscrire{" "}?</div>
          <div className="modal-action">
            <form method="post">
              <button className="btn">Oui oui, je suis sûr !</button>
            </form>
          </div>
        </div>

        <form className="modal-backdrop" method="dialog">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
