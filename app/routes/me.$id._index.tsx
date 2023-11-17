import { render } from "@react-email/components";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useRef } from "react";
import invariant from "tiny-invariant";

import AdminRegistationDeleted from "~/components/emails/adminRegistationDeleted";
import UnregisteredEmail from "~/components/emails/unregistered";
import FemaleIcon from "~/components/icons/FemaleIcon";
import MaleIcon from "~/components/icons/MaleIcon";
import { AppName } from "~/config";
import { deletePlayer, getCurrentDraw, getPlayer } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import { genderize, getCurrentYear } from "~/utils";
import { sendEmail } from "~/utils/email.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  invariant(id);

  const person = await getPerson(id);
  invariant(person);

  const draw = await getCurrentDraw();
  invariant(draw);

  const player = await getPlayer(draw.year, id);
  invariant(player);

  const assignedPerson = player.assignedId
    ? await getPerson(player.assignedId)
    : null;

  return json({ draw, person, assignedPerson });
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

export default function MeIndex() {
  const { person, assignedPerson } = useLoaderData<typeof loader>();
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <div
      className={clsx(
        "no-scrollbar flex max-w-full flex-1 snap-mandatory overflow-y-hidden px-4 text-xl md:px-12",
        "max-[900px]:snap-x max-[900px]:gap-8 max-[900px]:overflow-x-scroll",
        "divide-neutral min-[900px]:divide-x",
      )}
    >
      <div
        className={clsx(
          "rounded-box flex flex-1 snap-center flex-col overflow-y-auto bg-base-200 p-6 pt-0 md:px-8",
          "max-[900px]:min-w-full",
          "min-[900px]:rounded-e-none",
        )}
      >
        <h2 className="sticky top-0 z-10 flex items-center gap-4 bg-gradient-to-b from-base-200 py-6 md:py-8">
          <span className="text-xl font-bold uppercase">Tes informations</span>
          <NavLink
            className="btn btn-neutral btn-outline btn-xs ml-auto md:btn-sm"
            to="edit"
          >
            Modifier
          </NavLink>
        </h2>
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
                  className="aspect-square w-full max-w-xs object-cover"
                  src={`/uploads/${person.picture}`}
                />
              ) : (
                <i>Tu n’as pas fournit de photo</i>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "rounded-box flex flex-1 snap-center flex-col overflow-y-auto bg-base-200 p-6 pt-0 md:px-8",
          "max-[900px]:min-w-full",
          "min-[900px]:rounded-l-none",
        )}
      >
        <h2 className="sticky top-0 z-10 bg-gradient-to-b from-base-200 py-6 md:py-8">
          <span className="text-xl font-bold uppercase">
            Pour qui pries-tu ?
          </span>
        </h2>

        {assignedPerson ? (
          <div className="flex flex-col gap-6 md:gap-8">
            <div>
              Voici le nom de la personne qui fera l’objet de tes prières
              pendant toute la période de l’Avent !
            </div>

            <div
              className={clsx(
                "rounded-md border-4 border-dashed px-2 py-4 text-center text-[5vw] font-bold uppercase md:py-8 md:text-2xl",
                assignedPerson.gender === "male"
                  ? "border-accent bg-accent/20"
                  : "border-secondary bg-secondary/20",
              )}
            >
              {assignedPerson.firstName} {assignedPerson.lastName}
            </div>

            {assignedPerson.bio ? (
              <div>
                <div className="mb-4 font-bold">
                  Ce que {assignedPerson.firstName} a écrit à son sujet :
                </div>
                <div className="font-serif opacity-80">
                  {"« "}
                  {assignedPerson.bio}
                  {" »"}
                </div>
              </div>
            ) : null}

            {assignedPerson.picture ? (
              <div>
                <div className="mb-4 font-bold">
                  {assignedPerson.firstName} a fournit une photo{" "}
                  {genderize("de lui", assignedPerson.gender, "d’elle")} :
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                  <img
                    alt={`${assignedPerson.firstName} ${assignedPerson.lastName}`}
                    className="aspect-square h-32 object-cover"
                    src={`/uploads/${assignedPerson.picture}`}
                  />
                  <NavLink
                    className="btn btn-outline max-md:btn-sm"
                    target="__blank"
                    to={`/uploads/${assignedPerson.picture}`}
                  >
                    Voir en grand
                  </NavLink>
                </div>
              </div>
            ) : null}

            <div>
              <div className="divider" />
              <div className="mb-4 font-bold">N’oublie pas de :</div>
              <ul className="list-disc space-y-4">
                <li className="ml-6 pl-2">
                  🙏 Prier chaque jour pour {assignedPerson.firstName}.
                </li>
                <li className="ml-6 pl-2">
                  🙊 Ne rien lui dire avant le 24 décembre à minuit.
                </li>
                <li className="ml-6 pl-2">
                  🎁 De te dévoiler auprès d’
                  {genderize("lui", assignedPerson.gender, "elle")} une fois
                  l’opération terminée en lui offrant si possible un petit
                  cadeau selon tes moyens.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-6 italic">
                L’opération n’a pas encore démarré. Je ne peux pas encore te
                dire à qui devront s’adresser tes prières. Tu connaitras le nom
                de la personne le premier jour de l’Avent, c’est à dire le 3
                décembre prochain. Tu pourras le voir ici-même et je te
                l’enverrai aussi par email, alors surveille bien ta boîte de
                réception (et de spams aussi) ce jour là.
              </p>
              <p className="italic">
                Si tu le souhaites, tu peux toujours te désincrire en cliquant
                sur le bouton ci-dessous. Sache que ça ne sera plus possible une
                fois le tirage effectué.
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
    </div>
  );
}
