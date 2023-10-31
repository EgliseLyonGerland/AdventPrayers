import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import clsx from "clsx";
import { kebabCase } from "lodash";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { useLocalStorage } from "usehooks-ts";

import {
  type GetDrawPlayer,
  type GetDrawPlayerPerson,
  getDraw,
} from "~/models/draw.server";
import { type WithRequired } from "~/types";
import { pluralize, getYearParam } from "~/utils";
import { generate, toMarkdown, variables } from "~/utils/email";
import { sendEmail } from "~/utils/email.server";

type Player = WithRequired<GetDrawPlayer, "person">;
type Person = WithRequired<
  GetDrawPlayerPerson,
  "id" | "firstName" | "lastName" | "email"
>;
type Recipient = Person;

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });

  return json({ draw });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const year = getYearParam(params);
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "send": {
      const subject = `${formData.get("subject")}`;
      const body = `${formData.get("body")}`;
      const grouped = formData.get("grouped") === "true";
      const test = formData.get("test") === "true";
      const recipients = formData.getAll("recipients[]");

      invariant(subject, "You must provide a subject");
      invariant(body, "You must provide a body");
      invariant(recipients.length, "You must provide at least one recipient");

      const draw = await getDraw({ year });

      invariant(draw, `Unable to find draw ${year}`);

      const persons = recipients.reduce<GetDrawPlayer[]>((acc, recipient) => {
        const player = draw.players.find(
          (player) => player.personId === recipient,
        );

        if (!player || player.person.email === null) {
          return acc;
        }

        return acc.concat([player]);
      }, []);

      if (grouped) {
        await sendEmail({
          subject: generate(subject, draw),
          body: toMarkdown(generate(body, draw)),
          test,
          to: persons.map(({ person }) => ({
            name: `${person.firstName} ${person.lastName}`,
            address: person.email!,
          })),
        });

        break;
      }

      const emails = persons.map(({ person, assigned }) => ({
        subject: generate(subject, draw, person, assigned),
        body: toMarkdown(generate(body, draw, person, assigned)),
        test,
        to: {
          name: `${person.firstName} ${person.lastName}`,
          address: person.email!,
        },
        grouped: false,
      }));

      await emails.reduce<Promise<unknown>>(
        (chain, email) => chain.then(() => sendEmail(email)),
        Promise.resolve(),
      );

      break;
    }
  }

  return json({});
};

function getCheckerStatus(players: Player[], recipients: Recipient[]) {
  return players.reduce<"indeterminate" | "checked" | "unchecked">(
    (acc, curr, index) => {
      if (acc === "indeterminate") {
        return acc;
      }

      const found = !!recipients.find(
        (recipient) => curr.person.id === recipient.id,
      );

      if (found) {
        return index > 0 && acc === "unchecked" ? "indeterminate" : "checked";
      }

      return acc === "checked" ? "indeterminate" : acc;
    },
    "unchecked",
  );
}

const Mails = () => {
  const year = getYearParam(useParams());
  const { draw } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [recipients, setRecipients] = useLocalStorage<Recipient[]>(
    `draws.${year}.mails.draft.recipients`,
    [],
  );
  const [subject, setSubject] = useLocalStorage(
    `draws.${year}.mails.draft.subject`,
    "",
  );
  const [grouped, setGrouped] = useLocalStorage(
    `draws.${year}.mails.draft.groupe`,
    true,
  );
  const modalRef = useRef<HTMLDialogElement>(null);

  const [body, setBody] = useLocalStorage(`draws.${year}.mails.draft.body`, "");
  const submit = useSubmit();
  const checker = useRef<HTMLInputElement | null>(null);

  let players = draw?.players || [];

  if (search) {
    players = players.filter(({ person }) =>
      kebabCase(`${person.firstName} ${person.lastName}`).includes(search),
    );
  }

  const checkerStatus = getCheckerStatus(players, recipients);

  const handleSend = (test = false) => {
    const formData = new FormData();
    formData.set("_action", "send");
    formData.set("subject", subject);
    formData.set("body", body);
    formData.set("grouped", `${grouped}`);
    formData.set("test", `${test}`);

    recipients.forEach((recipient) => {
      formData.append("recipients[]", recipient.id);
    });

    submit(formData, { method: "post" });
  };

  useEffect(() => {
    if (!checker.current) {
      return;
    }

    switch (checkerStatus) {
      case "checked":
        checker.current.checked = true;
        checker.current.indeterminate = false;
        break;

      case "unchecked":
        checker.current.checked = false;
        checker.current.indeterminate = false;
        break;

      case "indeterminate":
        checker.current.checked = true;
        checker.current.indeterminate = true;
    }
  }, [checkerStatus]);

  const ready = recipients.length > 0 && subject.trim() && body.trim();

  if (!draw) {
    return;
  }

  const generatePreview = (text: string) => {
    let example = draw.players[0];
    if (recipients.length) {
      example =
        draw.players.find((player) => player.personId === recipients[0].id) ||
        example;
    }

    return generate(text, draw, example.person, example.assigned || undefined);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-4">
        <input
          className="input input-bordered input-secondary input-sm"
          onChange={(event) => {
            setSearch(kebabCase(event.target.value));
          }}
          placeholder="Recherche"
          type="text"
          value={search}
        />
        <div className="form-control ml-auto">
          <label className="label cursor-pointer">
            <input
              checked={grouped}
              className="checkbox checkbox-sm"
              onChange={(event) => {
                setGrouped(event.target.checked);
              }}
              type="checkbox"
            />
            <span className="label-text ml-2">Grouper</span>
          </label>
        </div>
        <button
          className={clsx(
            "btn btn-secondary btn-outline btn-sm",
            !ready && "btn-disabled",
          )}
          onClick={() => {
            modalRef.current?.showModal();
          }}
        >
          Envoyer
        </button>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl border border-base-content/10 bg-base-200 text-base-content">
        <div className="flex h-full w-full min-w-[1400px] divide-x divide-neutral-content overflow-hidden dark:divide-neutral-content/10">
          <div className="flex flex-col overflow-hidden">
            <label className="flex h-14 items-center gap-4 px-4 text-base-content/60">
              <input
                className="checkbox checkbox-sm"
                onChange={(event) => {
                  if (event.target.checked) {
                    setRecipients(players.map((player) => player.person));
                  } else {
                    setRecipients([]);
                  }
                }}
                ref={checker}
                type="checkbox"
              />
              {checkerStatus === "unchecked" ? "Tout cocher" : "Tout décocher"}
            </label>
            <ul className="w-72 flex-1 flex-nowrap divide-y divide-neutral-content overflow-y-auto dark:divide-neutral-content/10">
              {players.map(({ person, age }) => (
                <li className="px-4 py-2" key={person.id}>
                  <label
                    className="flex w-full items-center gap-4"
                    htmlFor={`player${person.id}`}
                  >
                    <input
                      checked={
                        !!recipients.find(
                          (recipient) => recipient.id === person.id,
                        )
                      }
                      className="checkbox checkbox-sm"
                      id={`player${person.id}`}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setRecipients(recipients.concat([person]));
                        } else {
                          setRecipients(
                            recipients.filter(
                              (recipient) => recipient.id !== person.id,
                            ),
                          );
                        }
                      }}
                      type="checkbox"
                    />
                    <div className="w-full overflow-hidden">
                      <div className="flex w-full items-center gap-2">
                        <span className="overflow-auto overflow-ellipsis whitespace-nowrap">{`${person.firstName} ${person.lastName}`}</span>
                        <span className="flex-shrink-0 text-sm text-base-content/50">
                          {age}
                        </span>
                      </div>
                      <div className="overflow-auto overflow-ellipsis whitespace-nowrap text-sm text-base-content/10">
                        {person.email}
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="divide-y divide-neutral-content border-b border-white/10 dark:divide-neutral-content/10">
              <div className="flex p-4">
                <span className="mr-2 whitespace-nowrap font-bold opacity-50">
                  À :
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {recipients.slice(0, 10).map((recipient) => (
                    <span
                      className="rounded-md bg-neutral pl-2 text-sm text-neutral-content flex-center"
                      data-tip={recipient.email}
                      key={recipient.id}
                    >
                      <span className="cursor-default">{`${recipient.firstName} ${recipient.lastName}`}</span>

                      <button
                        className="btn btn-circle btn-ghost btn-xs ml-1"
                        onClick={() => {
                          setRecipients(
                            recipients.filter(
                              (item) => item.id !== recipient.id,
                            ),
                          );
                        }}
                      >
                        <XMarkIcon height={16} />
                      </button>
                    </span>
                  ))}
                  {recipients.length > 10 ? (
                    <span
                      className="tooltip tooltip-bottom tooltip-secondary cursor-default px-2"
                      data-tip={recipients
                        .slice(10)
                        .map(
                          (recipient) =>
                            `${recipient.firstName} ${recipient.lastName}`,
                        )
                        .join(", ")}
                    >
                      <span className="text-sm opacity-50">
                        {recipients.length - 10} de plus
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center p-4">
                <span className="mr-2 whitespace-nowrap font-bold opacity-50">
                  Sujet :
                </span>
                <input
                  className="input input-sm w-full"
                  defaultValue={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                  }}
                  type="text"
                />
              </div>
            </div>
            <ReactTextareaAutocomplete
              className="block h-full w-full resize-none bg-transparent p-4 font-mono outline-0 placeholder:font-sans placeholder:italic placeholder:opacity-50"
              containerClassName="h-full w-full relative"
              dropdownClassName="absolute"
              listClassName="menu menu-compact mt-6"
              loadingComponent={() => <div>Loading</div>}
              minChar={0}
              onChange={(event) => {
                setBody(event.target.value);
              }}
              placeholder="Écris ton message..."
              trigger={{
                "%": {
                  dataProvider: () => variables,
                  component: ({ entity }) => <span>{`${entity}`}</span>,
                  output: (item) => `%${item}%`,
                },
              }}
              value={body}
            />
          </div>
          <div className="h-full flex-1 overflow-y-auto bg-white/5 px-8">
            <p className="mb-4 border-b border-white/10 py-6 text-2xl font-bold">
              {subject ? generatePreview(subject) : "Aucun titre"}
            </p>
            <div
              className="prose"
              dangerouslySetInnerHTML={{
                __html: toMarkdown(generatePreview(body)),
              }}
            />
          </div>
        </div>
      </div>
      <dialog className="modal" ref={modalRef}>
        <div className="modal-box max-w-2xl">
          <h3 className="text-lg font-bold">Confirmation</h3>
          <p className="py-4">
            Vous vous apprêtez à envoyer un message à {recipients.length}{" "}
            {pluralize("personne", recipients)}.
            <br />
            <br />
            Souhaitez-vous continuer ?
          </p>
          <div className="mt-8 flex gap-4">
            <form method="dialog">
              <button className="btn btn-sm">Annuler</button>
            </form>
            <button
              className="btn btn-sm ml-auto"
              onClick={() => {
                handleSend(true);
              }}
            >
              Envoyer un mail de test
            </button>
            <button
              className="btn btn-secondary btn-outline btn-sm"
              onClick={() => {
                handleSend();
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button>Annuler</button>
        </form>
      </dialog>
    </div>
  );
};

export default Mails;
