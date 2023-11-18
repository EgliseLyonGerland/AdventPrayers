import { XMarkIcon } from "@heroicons/react/24/outline";
import { render } from "@react-email/components";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  NavLink,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "@remix-run/react";
import clsx from "clsx";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useRef } from "react";
import invariant from "tiny-invariant";

import AdminRegistationDeleted from "~/components/emails/adminRegistationDeleted";
import UnregisteredEmail from "~/components/emails/unregistered";
import Picture from "~/components/me/picture";
import Text from "~/components/text";
import { AppName } from "~/config";
import { deletePlayer, getCurrentDraw, getPlayer } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import {
  formatDate,
  genderize,
  getCurrentYear,
  getFirstAdventSundayDate,
} from "~/utils";
import { sendEmail } from "~/utils/email.server";
import t from "~/utils/i18n";

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

  const startsAt = getFirstAdventSundayDate(draw.year);

  return json({ draw, person, assignedPerson, startsAt });
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { person, assignedPerson, startsAt } = useLoaderData<typeof loader>();
  const modalRef = useRef<HTMLDialogElement>(null);

  const showInfos = searchParams.get("showInfos") === "true";

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 text-xl md:px-12">
      <div className="relative min-h-[88px]">
        <motion.div
          animate={{ height: showInfos ? "auto" : 88 }}
          className={clsx(
            "rounded-box relative flex flex-col justify-center bg-base-300 px-4 sm:px-8",
            showInfos && "min-h-[88px]",
          )}
          initial={false}
          transition={{
            type: "tween",
            ease: "anticipate",
            duration: showInfos ? 1 : 0.5,
          }}
        >
          {showInfos ? (
            <>
              <NavLink
                className="btn btn-circle btn-ghost absolute right-4 top-4 md:right-6 md:top-6"
                to={location.pathname}
              >
                <XMarkIcon className="h-8" />
              </NavLink>
              <motion.div
                animate={{ opacity: showInfos ? 1 : 0 }}
                className="my-8 min-h-full"
                initial={{ opacity: 0 }}
                key="expanded"
                transition={{ delay: 1 }}
              >
                <div className="mx-auto flex max-w-2xl flex-wrap gap-12">
                  <div>
                    <div className="mb-2 text-lg font-bold">Prénom</div>
                    <div className="opacity-60">{person.firstName}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-lg font-bold">Nom</div>
                    <div className="opacity-60">{person.lastName}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-lg font-bold">Adresse email</div>
                    <div className="opacity-60">{person.email}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-lg font-bold">Genre</div>
                    <div className="opacity-60">{t(person.gender)}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-lg font-bold">Tranche d’age</div>
                    <div className="opacity-60">{t(person.age)}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-lg font-bold">À ton sujet</div>
                    <div className="max-w-md opacity-60">
                      {person.bio ? (
                        person.bio
                      ) : (
                        <i>Tu n’as rien écrit sur toi</i>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="mb-4 text-lg font-bold">Ta photo</div>
                    <div>
                      {person.picture ? (
                        <Picture
                          src={`/uploads/${person.picture}`}
                          title={`${person.firstName} ${person.lastName}`}
                        />
                      ) : (
                        <i>Tu n’as pas fournit de photo</i>
                      )}
                    </div>
                  </div>
                  <NavLink
                    className="btn btn-neutral ml-auto mt-8 w-full"
                    to="edit"
                  >
                    Modifier
                  </NavLink>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              animate={{ opacity: showInfos ? 0 : 1 }}
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              key="minimal"
              transition={{ delay: 0.5 }}
            >
              {person.picture ? (
                <div className="avatar">
                  <div className="h-10 rounded-full md:h-12">
                    <img
                      alt={person.picture}
                      src={`/uploads/${person.picture}`}
                    />
                  </div>
                </div>
              ) : null}
              <div className="overflow-hidden text-base sm:text-xl">
                <div className="truncate font-bold">
                  {person.firstName} {person.lastName}
                </div>
                <div className="truncate">{person.email}</div>
              </div>

              <NavLink
                className="btn btn-outline btn-sm ml-auto"
                to="?showInfos=true"
              >
                Mes infos
              </NavLink>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div
        className={clsx(
          "rounded-box flex min-h-full flex-1 flex-col bg-base-200",
          showInfos && "hidden",
        )}
      >
        <div className="flex flex-1 flex-col p-6 md:px-8">
          {assignedPerson ? (
            <div className="flex gap-8 max-lg:flex-col md:gap-12">
              <div className="flex grow flex-col gap-8 md:gap-12 lg:w-[55%]">
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
                      {genderize("de lui", assignedPerson, "d’elle")} :
                    </div>
                    <Picture
                      src={`/uploads/${assignedPerson.picture}`}
                      title={`${assignedPerson.firstName} ${assignedPerson.lastName}`}
                    />
                  </div>
                ) : null}
              </div>
              <div className="divider" />
              <div className="lg:w-[45%]">
                <div className="mb-4 font-bold">N’oublie pas de :</div>
                <ul className="list-disc space-y-4">
                  <li className="ml-6 pl-2">
                    🙏{"  "}De Prier chaque jour pour {assignedPerson.firstName}
                    .
                  </li>
                  <li className="ml-6 pl-2">
                    🙊{"  "}De le faire secrètement, sans le lui dire, pendant
                    toute la période de l’Avent.
                  </li>
                  <li className="ml-6 pl-2">
                    🎁{"  "}De te dévoiler auprès d’
                    {genderize("lui", assignedPerson, "elle")} à partir du 24
                    décembre à minuit en lui offrant si possible un petit cadeau
                    selon tes moyens.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="m-auto max-w-[600px] py-6">
              <div className="mb-8 space-y-6 leading-normal">
                <h1 className="mb-8 text-2xl font-bold md:mb-12">
                  👋 Hey {person.firstName},
                </h1>
                <p>Bienvenue dans ton espace participant !</p>
                <p>
                  L’opération n’a pas encore démarré. C’est pourquoi je ne peux
                  pas encore te dire à qui devront s’adresser tes prières.
                </p>
                <p>
                  Tu connaitras le nom de la personne le premier jour de
                  l’Avent, c’est à dire le {formatDate(dayjs(startsAt))}{" "}
                  prochain. Tu pourras le consulter ici-même et je te l’enverrai
                  également par email, alors surveille bien ta boîte de
                  réception (et de spams aussi) ce jour{" "}là.
                </p>
                <p>
                  Si tu le souhaites, tu peux toujours te désincrire en cliquant
                  sur le bouton ci-dessous. Sache que ça ne sera plus possible
                  une fois le tirage effectué.
                </p>
              </div>
              <button
                className="btn btn-neutral w-full"
                onClick={() => {
                  modalRef.current?.showModal();
                }}
              >
                Me désinscrire
              </button>
            </div>
          )}
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
              <button
                className="btn btn-neutral btn-sm md:btn-md"
                formMethod="dialog"
              >
                <Text alt="Je réféchis">Attends je réfléchis...</Text>
              </button>
              <button className="btn btn-outline btn-sm md:btn-md">
                Je suis sûr !
              </button>
            </form>
          </div>
        </div>

        <form className="modal-backdrop" method="dialog">
          <button>close</button>
        </form>
      </dialog>
    </main>
  );
}
