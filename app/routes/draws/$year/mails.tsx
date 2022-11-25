import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import { kebabCase } from "lodash";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { useLocalStorage } from "usehooks-ts";

import { getDraw } from "~/models/draw.server";
import { getPersons } from "~/models/person.server";
import type { WithRequired } from "~/utils";
import { getYearParam } from "~/utils";
import { generate, variables } from "~/utils/email";
import type { Address } from "~/utils/email.server";
import { sendEmail } from "~/utils/email.server";

type LoaderData = {
  draw: Awaited<ReturnType<typeof getDraw>>;
};

type Player = WithRequired<
  NonNullable<LoaderData["draw"]>["players"][number],
  "person"
>;
type Person = WithRequired<
  Player["person"],
  "id" | "firstName" | "lastName" | "email"
>;
type Recipient = WithRequired<
  Person,
  "id" | "firstName" | "lastName" | "email"
>;

export const loader: LoaderFunction = async ({ params }) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });

  return json({ draw });
};

export const action: ActionFunction = async ({ request, params }) => {
  const year = getYearParam(params);
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "send":
      const persons = await getPersons();
      const subject = `${formData.get("subject")}`;
      const body = `${formData.get("body")}`;
      const recipients = formData.getAll("recipients[]");

      invariant(subject, "You must provide a subject");
      invariant(body, "You must provide a body");
      invariant(recipients.length, "You must provide at least one recipient");

      const draw = await getDraw({ year });

      if (!draw) {
        break;
      }

      await Promise.all(
        recipients.map((recipient) => {
          const player = draw.players.find(
            (player) => player.personId === recipient
          );

          if (!player) {
            return null;
          }

          return sendEmail({
            subject: generate(subject, draw, player.person, player.assigned),
            body: generate(body, draw, player.person, player.assigned),
            recipients: persons.reduce<Address[]>((acc, person) => {
              if (recipients.includes(person.id) && person.email) {
                acc.push({
                  name: `${person.firstName} ${person.lastName}`,
                  address: person.email,
                });
              }
              return acc;
            }, []),
          });
        })
      );

      break;
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
        (recipient) => curr.person.id === recipient.id
      );

      if (found) {
        return index > 0 && acc === "unchecked" ? "indeterminate" : "checked";
      }

      return acc === "checked" ? "indeterminate" : acc;
    },
    "unchecked"
  );
}

const Mails = () => {
  const year = getYearParam(useParams());
  const { draw } = useLoaderData<LoaderData>();
  const [search, setSearch] = useState("");
  const [recipients, setRecipients] = useLocalStorage<Recipient[]>(
    `draws.${year}.mails.draft.recipients`,
    []
  );
  const [subject, setSubject] = useLocalStorage(
    `draws.${year}.mails.draft.subject`,
    ""
  );
  const [body, setBody] = useLocalStorage(`draws.${year}.mails.draft.body`, "");
  const submit = useSubmit();
  const checker = useRef<HTMLInputElement | null>(null);

  let players = draw?.players || [];

  if (search) {
    players = players.filter(({ person }) =>
      kebabCase(`${person.firstName} ${person.lastName}`).includes(search)
    );
  }

  let checkerStatus = getCheckerStatus(players, recipients);

  const handleSend = () => {
    const formData = new FormData();
    formData.set("_action", "send");
    formData.set("subject", subject);
    formData.set("body", body);

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
    <>
      <div className="container mx-auto mb-4 flex items-center gap-4">
        <input
          className="input-bordered input-secondary input input-sm"
          onChange={(event) => {
            setSearch(kebabCase(event.target.value));
          }}
          placeholder="Recherche"
          type="text"
          value={search}
        />
        <button
          className="btn-accent btn-sm btn ml-auto"
          disabled={!ready}
          onClick={handleSend}
        >
          Envoyer
        </button>
      </div>
      <div className="relative mx-auto w-full flex-1 overflow-hidden 2xl:container">
        <div className="absolute h-full w-full overflow-x-auto rounded-xl bg-base-200">
          <div className="flex h-full w-full min-w-[1400px]">
            <div className="flex flex-col overflow-hidden">
              <label className="flex h-14 items-center gap-4 px-4 text-white/60">
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
                {checkerStatus === "unchecked"
                  ? "Tout cocher"
                  : "Tout décocher"}
              </label>
              <ul className="menu menu-compact menu-vertical w-72 flex-1 flex-nowrap divide-y divide-white/10 overflow-y-auto bg-base-300">
                {players.map(({ person, age }) => (
                  <li key={person.id}>
                    <label
                      className="flex w-full gap-4"
                      htmlFor={`player${person.id}`}
                    >
                      <input
                        checked={
                          !!recipients.find(
                            (recipient) => recipient.id === person.id
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
                                (recipient) => recipient.id !== person.id
                              )
                            );
                          }
                        }}
                        type="checkbox"
                      />
                      <div className="w-full overflow-hidden">
                        <div className="flex w-full gap-2">
                          <span className="overflow-auto overflow-ellipsis whitespace-nowrap">{`${person.firstName} ${person.lastName}`}</span>
                          <span className="flex-shrink-0 text-sm text-white/50">
                            {age}
                          </span>
                        </div>
                        <div className="overflow-auto overflow-ellipsis whitespace-nowrap text-sm text-white/30">
                          {person.email}
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="divide-y divide-white/10 border-b border-white/10 bg-base-200">
                <div className="flex p-4">
                  <span className="mr-2 whitespace-nowrap font-bold opacity-50">
                    À :
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {recipients.slice(0, 10).map((recipient) => (
                      <span
                        className="rounded-md bg-neutral pl-2 text-sm flex-center"
                        data-tip={recipient.email}
                        key={recipient.id}
                      >
                        <span className="cursor-default">{`${recipient.firstName} ${recipient.lastName}`}</span>

                        <button
                          className="btn-ghost btn-xs btn-circle btn ml-1"
                          onClick={() => {
                            setRecipients(
                              recipients.filter(
                                (item) => item.id !== recipient.id
                              )
                            );
                          }}
                        >
                          <XMarkIcon height={16} />
                        </button>
                      </span>
                    ))}
                    {recipients.length > 10 && (
                      <span
                        className="tooltip tooltip-bottom tooltip-accent cursor-default px-2"
                        data-tip={recipients
                          .slice(10)
                          .map(
                            (recipient) =>
                              `${recipient.firstName} ${recipient.lastName}`
                          )
                          .join(", ")}
                      >
                        <span className="text-sm opacity-50">
                          {recipients.length - 10} de plus
                        </span>
                      </span>
                    )}
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
                className="text-md h-full w-full resize-none bg-transparent p-4 font-mono text-white/60 outline-0 placeholder:font-sans placeholder:italic placeholder:opacity-50"
                containerClassName="h-full w-full relative"
                defaultValue={body}
                dropdownClassName="absolute"
                listClassName="menu menu-compact bg-neutral mt-6"
                loadingComponent={({ data }) => <div>Loading</div>}
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
              ></ReactTextareaAutocomplete>
            </div>
            <div className="h-full flex-1 overflow-y-auto bg-white p-4 text-black">
              <p className="mb-4 border-b pb-4 text-2xl font-bold">
                {subject ? generatePreview(subject) : "Aucun titre"}
              </p>
              <p className="whitespace-pre-wrap">{generatePreview(body)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Mails;
