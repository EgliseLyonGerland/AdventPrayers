import { render } from "@react-email/components";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useRef } from "react";
import invariant from "tiny-invariant";

import AdminRegistationDeleted from "~/components/emails/adminRegistationDeleted";
import UnregisteredEmail from "~/components/emails/unregistered";
import FemaleIcon from "~/components/icons/FemaleIcon";
import MaleIcon from "~/components/icons/MaleIcon";
import Logo from "~/components/logo";
import { AppName } from "~/config";
import { deletePlayer, getCurrentDraw } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import { genderize, getCurrentYear } from "~/utils";
import { sendEmail } from "~/utils/email.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  invariant(id, "No ID provided");

  const person = await getPerson(id);

  if (!person) {
    throw new Response(null, {
      status: 404,
      statusText: "On ne se connaît pas je pense",
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
      statusText: `Tu n’es pas encore ${genderize("inscrit", person.gender)}`,
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
      statusText: "On ne se connaît pas je pense",
    });
  }

  const year = getCurrentYear();

  await deletePlayer({ id, year });

  if (person.email) {
    sendEmail({
      body: render(<UnregisteredEmail person={person} />),
      subject: UnregisteredEmail.title,
      to: {
        address: person.email,
        name: person.firstName,
      },
    });
  }

  sendEmail({
    body: render(<AdminRegistationDeleted person={person} />),
    subject: AdminRegistationDeleted.title,
    to: [{ address: "enaventlapriere@egliselyongerland.org", name: AppName }],
  });

  return redirect("/me/unregistered");
};

export default function Me() {
  const { draw, person } = useLoaderData<typeof loader>();
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="mx-auto flex h-screen max-w-[1400px] flex-col items-center gap-8 overflow-y-hidden px-4 py-8 md:gap-12 md:p-12">
        <Logo className="h-[15vw] md:h-28" />
        <div
          className={clsx(
            "no-scrollbar flex max-w-full flex-1 snap-mandatory overflow-y-hidden",
            "max-[900px]:snap-x max-[900px]:gap-8 max-[900px]:overflow-x-scroll",
            "divide-neutral min-[900px]:divide-x",
          )}
        >
          <div
            className={clsx(
              "rounded-box flex flex-1 snap-center flex-col gap-12 overflow-y-auto bg-base-200 p-8 text-xl",
              "max-[900px]:min-w-full",
              "min-[900px]:rounded-e-none",
            )}
          >
            <h2 className="text-xl font-bold uppercase">Tes informations</h2>
            <div className="flex flex-col">
              <div>
                {person.firstName} {person.lastName}{" "}
                <span className="ml-2">
                  {person.gender === "male" ? (
                    <MaleIcon className="inline-block h-4 opacity-60" />
                  ) : (
                    <FemaleIcon className="inline-block h-4 opacity-60" />
                  )}
                </span>
                <span className="badge badge-neutral ml-2">{person.age}</span>
              </div>
              <div className="opacity-60">{person.email}</div>
              <div className="mt-8">
                <div className="mb-2 text-lg font-bold">À ton sujet</div>
                <div className="opacity-60">
                  {person.bio ? person.bio : <i>Tu n’as rien écrit sur toi</i>}
                </div>
              </div>
              <div className="mt-8">
                <div className="mb-4 text-lg font-bold">Ta photo</div>
                <div>
                  {person.picture ? (
                    <img
                      alt={`${person.firstName} ${person.lastName}`}
                      className="aspect-square w-full max-w-sm object-cover"
                      src={`/uploads/${person.picture}`}
                    />
                  ) : (
                    <i>Tu n’as pas fournit de photo</i>
                  )}
                </div>
              </div>
            </div>
            <div className="tooltip mt-auto" data-tip="Bientôt, promis !">
              <button
                className="btn btn-secondary btn-outline w-full"
                disabled={true}
              >
                Modifier
              </button>
            </div>
          </div>
          <div
            className={clsx(
              "rounded-box flex flex-1 snap-center flex-col gap-12 overflow-y-auto bg-base-200 p-8 text-xl",
              "max-[900px]:min-w-full",
              "min-[900px]:rounded-l-none",
            )}
          >
            <h2 className="text-xl font-bold uppercase">Pour qui pries-tu ?</h2>

            {draw.drawn ? (
              "todo"
            ) : (
              <>
                <div className="mb-8">
                  <p className="mb-6 italic">
                    L’opération n’a pas encore démarré. Je ne peux pas encore te
                    dire à qui devront s’adresser tes prières. Tu connaitras le
                    nom de la personne le premier jour de l’Avent, c’est à dire
                    le 3 décembre prochain. Tu pourras le voir ici-même et je te
                    l’enverrai aussi par email, alors surveille bien ta boîte de
                    réception (et de spams aussi) ce jour là.
                  </p>
                  <p className="italic">
                    Si tu le souhaites, tu peux toujours te désincrire en
                    cliquant sur le bouton ci-dessous. Sache que ça ne sera plus
                    possible une fois le tirage effectué.
                  </p>
                </div>
                <button
                  className="btn btn-neutral mt-auto w-full"
                  onClick={() => {
                    modalRef.current?.showModal();
                  }}
                >
                  Me désinscrire
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <dialog className="modal" ref={modalRef}>
        <div className="modal-box">
          <h3 className="mb-4 text-xl font-bold md:text-2xl">
            Tu vas beaucoup me manquer{" "}😭
          </h3>
          <div>Es-tu sûr de vouloir te désinscrire{" "}?</div>
          <div className="modal-action">
            <form className="flex gap-2" method="post">
              <button className="btn btn-ghost" formMethod="dialog">
                Attends je réfléchis...
              </button>
              <button className="btn">Je suis sûr !</button>
            </form>
          </div>
        </div>

        <form className="modal-backdrop" method="dialog">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
