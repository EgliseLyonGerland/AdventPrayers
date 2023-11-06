import { LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import MiniSearch from "minisearch";
import { type ComponentProps, useMemo, useState } from "react";
import { useDebounce } from "usehooks-ts";

import PersonRecord from "~/components/admin/personRecord";
import SidePanel from "~/components/admin/sidePanel";
import { type Person } from "~/models/person.server";

import MergeForm from "./mergeForm";

function PersonRecordMaybe({
  person,
}: Partial<ComponentProps<typeof PersonRecord>>) {
  return person ? <PersonRecord person={person} /> : null;
}

interface Props {
  checkingPerson: Person;
  persons: Person[];
  onSubmit: (data: Person, linkTo?: string) => void;
}

export default function CheckForm({
  checkingPerson,
  persons,
  onSubmit,
}: Props) {
  const [linkTo, setLinkTo] = useState<Person>();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const index = useMemo(() => {
    const search = new MiniSearch<{ id: string; fullName: string }>({
      fields: ["fullName"],
      storeFields: ["fullName"],
    });

    search.addAll(
      persons.map((person) => ({
        id: person.id,
        fullName: `${person.firstName} ${person.lastName}`,
      })),
    );

    return search;
  }, [persons]);

  const suggestions = useMemo(
    () =>
      index.search(`${checkingPerson.firstName} ${checkingPerson.lastName}`),
    [checkingPerson, index],
  );

  const results = useMemo(
    () =>
      debouncedQuery.length > 1
        ? index.search(debouncedQuery, { prefix: true, fuzzy: true })
        : [],
    [index, debouncedQuery],
  );

  return (
    <div>
      <div className="flex flex-col gap-4">
        <PersonRecord person={checkingPerson} />
        <button
          className="btn btn-neutral"
          onClick={() => {
            onSubmit(checkingPerson);
          }}
        >
          Approuver
        </button>
      </div>

      {suggestions.length ? (
        <div className="my-12 flex flex-col gap-6">
          <h3 className="text-lg font-bold">Suggestions</h3>

          {suggestions.map((suggestion) => (
            <div className="flex items-center gap-4" key={suggestion.id}>
              <PersonRecordMaybe
                person={persons.find((person) => person.id === suggestion.id)}
              />

              <button
                className="btn btn-circle btn-neutral ml-auto"
                onClick={() => {
                  setLinkTo(
                    persons.find((person) => person.id === suggestion.id),
                  );
                }}
              >
                <LinkIcon className="h-6" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="my-12 flex flex-col gap-6">
        <h3 className="text-lg font-bold">Rechercher</h3>
        <div className="relative self-start">
          <input
            className="input input-secondary input-sm"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            placeholder="Recherche"
            type="text"
            value={query}
          />

          {query ? (
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

        {results.length ? (
          results.map((result) => (
            <div className="flex items-center gap-4" key={result.id}>
              <PersonRecordMaybe
                person={persons.find((person) => person.id === result.id)}
              />
              <button
                className="btn btn-circle btn-neutral ml-auto"
                onClick={() => {
                  setLinkTo(persons.find((person) => person.id === result.id));
                }}
              >
                <LinkIcon className="h-6" />
              </button>
            </div>
          ))
        ) : debouncedQuery.length > 1 ? (
          <i>Aucun résultat</i>
        ) : null}
      </div>

      <SidePanel
        onClose={() => {
          setLinkTo(undefined);
        }}
        open={Boolean(linkTo)}
      >
        {linkTo ? (
          <MergeForm
            onSubmit={(data) => {
              onSubmit(data, linkTo.id);
              setLinkTo(undefined);
            }}
            persons={[checkingPerson, linkTo]}
          />
        ) : null}
      </SidePanel>
    </div>
  );
}
