import { XMarkIcon } from "@heroicons/react/24/outline";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useMiniSearch } from "react-minisearch";
import { useDebounce } from "usehooks-ts";

import { getPersons } from "~/models/person.server";
import { pluralize } from "~/utils";

export const action = async () => json({});

export const loader = async () => {
  const persons = await getPersons();

  return json({ persons });
};

const totalPerPage = 30;

export default function Email() {
  const { persons } = useLoaderData<typeof loader>();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { search, searchResults, clearSearch } = useMiniSearch(persons, {
    fields: ["firstName", "lastName", "email"],
    searchOptions: {
      prefix: true,
    },
  });

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [clearSearch, debouncedQuery, search]);

  const filteredPersons = searchResults || persons;

  const paginatedPersons = filteredPersons.slice(
    (page - 1) * totalPerPage,
    page * totalPerPage,
  );

  return (
    <div className="py-12">
      <div className="mb-4 flex border-b border-base-content/10 pb-4">
        <div className="relative">
          <input
            className="input input-secondary input-sm"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            placeholder="Recherche"
            type="text"
            value={query}
          />

          {debouncedQuery ? (
            <button
              className="btn btn-circle btn-ghost btn-xs absolute right-2 mt-1"
              onClick={() => {
                setQuery("");
              }}
            >
              <XMarkIcon />
            </button>
          ) : null}
        </div>
        <div className="ml-auto opacity-50">
          {persons.length} {pluralize("personne", persons.length)}
        </div>
      </div>
      <table className="table table-zebra">
        <tbody>
          {paginatedPersons.map((person) => (
            <tr key={person.id}>
              <td>
                {person.picture ? (
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt={person.picture}
                        src={`/uploads/${person.picture}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
                      <span>
                        {`${person.firstName[0]}${person.lastName[0]}`.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </td>
              <td className="w-full">
                <div>
                  {person.firstName} <b>{person.lastName}</b>
                  <span className="ml-2 text-base-content/50">
                    {person.age}
                  </span>
                </div>
                <div className="opacity-60">
                  {person.email || <i>No email address</i>}

                  {person.exclude.length > 0 ? (
                    <>
                      <span>•</span>
                      <span
                        className="tooltip tooltip-secondary"
                        data-tip={person.exclude
                          .map((item) => `${item.firstName} ${item.lastName}`)
                          .join(`, `)}
                      >
                        {person.exclude.length}{" "}
                        {pluralize("exclusion", person.exclude)}
                      </span>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredPersons.length > totalPerPage ? (
        <div className="mt-8 flex">
          <div className="join mx-auto">
            {[
              ...Array(Math.ceil(filteredPersons.length / totalPerPage)).keys(),
            ].map((index) => (
              <button
                className={clsx(
                  "btn join-item",
                  page === index + 1 && "btn-active",
                )}
                key={index}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
