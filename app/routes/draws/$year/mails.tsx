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

  return (
    <div className="relative flex-1 rounded-md">
      <div className="absolute flex h-full w-full bg-base-200">
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
        <div className="flex-1 p-4">
          <div className="flex flex-wrap gap-1">
            {recipients.map((recipient) => (
              <span
                key={recipient.id}
                className="rounded-full bg-neutral pl-3 text-sm flex-center"
                data-tip={recipient.email}
              >
                <span
                  className="tooltip tooltip-accent cursor-default"
                  data-tip={recipient.email}
                >{`${recipient.firstName} ${recipient.lastName}`}</span>

                <button
                  className="btn-ghost btn-sm btn-circle btn ml-1"
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
      </div>
    </div>
  );
};

export default Mails;
