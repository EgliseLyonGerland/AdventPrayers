import { XMarkIcon } from "@heroicons/react/24/outline";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { getDraw } from "~/models/draw.server";
import { getYearParam } from "~/utils";

type LoaderData = {
  draw: Awaited<ReturnType<typeof getDraw>>;
};

type Recipient = NonNullable<LoaderData["draw"]>["players"][number]["person"];

export const loader: LoaderFunction = async ({ params }) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });

  return json({ draw });
};

const Mails = () => {
  const { draw } = useLoaderData<LoaderData>();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="relative flex-1">
      <div className="absolute flex h-full w-full overflow-hidden rounded-xl bg-base-200">
        <ul className="menu menu-compact menu-vertical h-full flex-nowrap divide-y divide-white/10 overflow-y-auto bg-base-300">
          {draw?.players.map(({ person, age }) => (
            <li key={person.id}>
              <label htmlFor={`player${person.id}`} className="flex gap-4">
                <input
                  id={`player${person.id}`}
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={
                    !!recipients.find((recipient) => recipient.id === person.id)
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
                    <span className="ml-2 text-sm text-white/50">{age}</span>
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
                          recipients.filter((item) => item.id !== recipient.id)
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
  );
};

export default Mails;
