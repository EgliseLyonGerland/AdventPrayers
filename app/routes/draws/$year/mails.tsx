import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import { getDraw } from "~/models/draw.server";
import { getPersons } from "~/models/person.server";
import { getYearParam } from "~/utils";
import type { Address } from "~/utils/email";
import { sendEmail } from "~/utils/email";

type LoaderData = {
  draw: Awaited<ReturnType<typeof getDraw>>;
};

type Recipient = NonNullable<LoaderData["draw"]>["players"][number]["person"];

export const loader: LoaderFunction = async ({ params }) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });

  return json({ draw });
};

export const action: ActionFunction = async ({ request, params }) => {
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

      await sendEmail({
        subject,
        body,
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
      break;
  }

  return json({});
};

const Mails = () => {
  const { draw } = useLoaderData<LoaderData>();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const submit = useSubmit();

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

  return (
    <>
      <div className="container mx-auto mb-4 flex items-center gap-4">
        <button className="btn-accent btn-sm btn ml-auto" onClick={handleSend}>
          Envoyer
        </button>
      </div>
      <div className="relative mx-auto w-full flex-1 overflow-hidden 2xl:container">
        <div className="absolute h-full w-full overflow-x-auto rounded-xl bg-base-200">
          <div className="flex h-full w-full min-w-[1400px]">
            <ul className="menu menu-compact menu-vertical h-full flex-nowrap divide-y divide-white/10 overflow-y-auto bg-base-300">
              {draw?.players.map(({ person, age }) => (
                <li key={person.id}>
                  <label htmlFor={`player${person.id}`} className="flex gap-4">
                    <input
                      id={`player${person.id}`}
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={
                        !!recipients.find(
                          (recipient) => recipient.id === person.id
                        )
                      }
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
                    />
                    <div>
                      <div>
                        {`${person.firstName} ${person.lastName}`}
                        <span className="ml-2 text-sm text-white/50">
                          {age}
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm text-white/30">
                        <span>{person.email}</span>
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex flex-1 flex-col">
              <div className="divide-y divide-white/10 border-b border-white/10 bg-base-200">
                <div className="flex p-4">
                  <span className="mr-2 whitespace-nowrap font-bold opacity-50">
                    À :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {recipients.map((recipient) => (
                      <span
                        key={recipient.id}
                        className="rounded-md bg-neutral pl-2 text-sm flex-center"
                        data-tip={recipient.email}
                      >
                        <span
                          className="tooltip tooltip-bottom tooltip-accent cursor-default"
                          data-tip={recipient.email}
                        >{`${recipient.firstName} ${recipient.lastName}`}</span>

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
                  </div>
                </div>
                <div className="flex items-center p-4">
                  <span className="mr-2 whitespace-nowrap font-bold opacity-50">
                    Sujet :
                  </span>
                  <input
                    type="text"
                    className="input input-sm w-full"
                    onChange={(event) => {
                      setSubject(event.target.value);
                    }}
                  />
                </div>
              </div>
              <textarea
                className="text-md h-full w-full resize-none bg-transparent p-4 font-mono text-white/60 outline-0 placeholder:font-sans placeholder:italic placeholder:opacity-50"
                placeholder="Écris ton message..."
                onChange={(event) => {
                  setBody(event.target.value);
                }}
              ></textarea>
            </div>
            <div className="h-full flex-1 overflow-y-auto bg-white p-4 text-black">
              <p className="mb-4 border-b pb-4 text-2xl font-bold">
                {subject || "Aucun titre"}
              </p>
              <p className="whitespace-pre-wrap">{body}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Mails;
