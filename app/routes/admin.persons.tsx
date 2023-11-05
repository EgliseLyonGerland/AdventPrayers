import { XMarkIcon } from "@heroicons/react/24/outline";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import MiniSearch from "minisearch";
import { useEffect, useState } from "react";
import { useMiniSearch } from "react-minisearch";
import { useDebounce } from "usehooks-ts";

import PersonRecord from "~/components/admin/personRecord";
import { prisma } from "~/db.server";
import { getPersons } from "~/models/person.server";
import { pluralize } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "deleteMany": {
      const ids = formData.getAll("ids[]").map(String);

      await prisma.person.deleteMany({ where: { id: { in: ids } } });
    }
  }

  return json({});
};

export const loader = async () => {
  const persons = (await getPersons()).map((person) => ({
    ...person,
    fullName: `${person.firstName} ${person.lastName}`,
  }));

  const index = new MiniSearch<(typeof persons)[number]>({
    fields: ["fullName"],
    storeFields: ["fullName"],
  });

  index.addAll(persons);

  return json({
    persons: persons.map((person) => ({
      ...person,
      twins: index
        .search(person.fullName)
        .filter((twin) => twin.id !== person.id)
        .filter((twin) => twin.score > 20),
    })),
  });
};

const totalPerPage = 30;

export default function Persons() {
  const { persons } = useLoaderData<typeof loader>();
  const [selectedPersons, setSelectedPersons] = useState(new Set<string>());

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { search, searchResults, clearSearch } = useMiniSearch(persons, {
    fields: ["fullName"],
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
    <>
      <div className="flex gap-8 py-8">
        <div className="flex-1">
          <div className="mb-4 flex items-center border-b border-base-content/10 pb-4">
            <div className="relative">
              <input
                className="input input-secondary input-sm"
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                  setPage(1);
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
                    setPage(1);
                  }}
                >
                  <XMarkIcon />
                </button>
              ) : null}
            </div>
            <div className="ml-auto opacity-50">
              {filteredPersons.length}{" "}
              {pluralize("personne", filteredPersons.length)}
            </div>
          </div>
          <table className="table table-zebra">
            <tbody>
              {paginatedPersons.map((person) => (
                <tr key={person.id}>
                  <td>
                    <input
                      checked={selectedPersons.has(person.id)}
                      className="checkbox checkbox-sm block"
                      onChange={() => {
                        selectedPersons.has(person.id)
                          ? selectedPersons.delete(person.id)
                          : selectedPersons.add(person.id);

                        setSelectedPersons(new Set(selectedPersons));
                      }}
                      type="checkbox"
                    />
                  </td>
                  <td className="w-full">
                    <PersonRecord person={person} />
                  </td>
                  <td className="whitespace-nowrap">
                    {person.twins.length ? (
                      <div
                        className="tooltip"
                        data-tip={person.twins
                          .map((twin) => twin.fullName)
                          .join("\n")}
                      >
                        <button
                          className="btn btn-neutral btn-xs"
                          onClick={() => {
                            setSelectedPersons(
                              new Set([
                                person.id,
                                ...person.twins.map(({ id }) => id),
                              ]),
                            );
                          }}
                        >
                          {person.twins.length}{" "}
                          {pluralize("doublon", person.twins.length)}
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPersons.length > totalPerPage ? (
            <div className="mt-8 flex">
              <div className="join mx-auto">
                {[
                  ...Array(
                    Math.ceil(filteredPersons.length / totalPerPage),
                  ).keys(),
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

        {selectedPersons.size ? (
          <Form
            className="w-[30vw] text-sm"
            method="post"
            onSubmit={(event) => {
              if (event.currentTarget._action.value === "deleteMany") {
                if (!confirm("Es-tu sûr de vouloir continuer ?")) {
                  event.preventDefault();
                  return;
                }
              }

              setSelectedPersons(new Set());
            }}
          >
            <div className="fixed inset-y-8 w-[30vw] overflow-auto bg-base-200 p-6">
              <div className="mb-4 flex items-center opacity-50">
                {selectedPersons.size}{" "}
                {pluralize(
                  ["personne sélectionnée", "personnes sélectionnées"],
                  selectedPersons.size,
                )}
              </div>

              <div className="flex items-center gap-4 py-3">
                <input
                  checked={true}
                  className="checkbox checkbox-sm"
                  onChange={() => {
                    setSelectedPersons(new Set());
                  }}
                  type="checkbox"
                />
                <div className="dropdown">
                  <label
                    className="btn btn-neutral btn-xs"
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={0}
                  >
                    Actions
                  </label>
                  <ul
                    className="menu dropdown-content rounded-box z-[1] mt-2 w-52 border border-base-content/10 bg-base-100 p-2 shadow"
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={0}
                  >
                    <li>
                      <button name="_action" type="submit" value="deleteMany">
                        Supprimer
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="divide-y divide-base-content/10">
                {persons
                  .filter((person) => selectedPersons.has(person.id))
                  .map((person) => (
                    <div
                      className="flex items-center gap-6 py-3"
                      key={person.id}
                    >
                      <input
                        key={person.id}
                        name="ids[]"
                        type="hidden"
                        value={person.id}
                      />
                      <input
                        checked={true}
                        className="checkbox checkbox-sm"
                        onChange={() => {
                          selectedPersons.delete(person.id);
                          setSelectedPersons(new Set(selectedPersons));
                        }}
                        type="checkbox"
                      />
                      <PersonRecord person={person} />
                    </div>
                  ))}
              </div>
            </div>
          </Form>
        ) : null}
      </div>
    </>
  );
}
