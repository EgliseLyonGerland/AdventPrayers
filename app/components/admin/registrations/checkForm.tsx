import { XMarkIcon } from "@heroicons/react/24/outline";
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
  onClose: () => void;
}

export default function CheckForm({
  checkingPerson,
  persons,
  onSubmit,
  onClose,
}: Props) {
  const [linkTo, setLinkTo] = useState<Person>();
  const [query, setQuery] = useState("");
  const [showMergeForm, setShowMergeForm] = useState(false);
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
      index
        .search(`${checkingPerson.firstName} ${checkingPerson.lastName}`)
        .filter(({ id }) => id !== linkTo?.id),
    [checkingPerson, index, linkTo],
  );

  const results = useMemo(
    () =>
      debouncedQuery.length > 1
        ? index
            .search(debouncedQuery, { prefix: true, fuzzy: true })
            .filter(({ id }) => id !== linkTo?.id)
        : [],
    [index, debouncedQuery, linkTo],
  );

  return (
    <>
      <div className="flex flex-col gap-12 p-8">
        <PersonRecord person={checkingPerson} />

        <div>
          <h3 className="mb-4 text-lg font-bold">Fusionner avec...</h3>

          {linkTo ? (
            <div className="flex items-center gap-4">
              <PersonRecordMaybe person={linkTo} />
              <button
                className="btn btn-circle ml-auto"
                onClick={() => {
                  setLinkTo(undefined);
                }}
              >
                <XMarkIcon className="h-6" />
              </button>
            </div>
          ) : (
            <div className="italic opacity-60">Aucune fusion</div>
          )}
        </div>

        <div>
          <div className="relative mb-8 inline-block">
            <input
              className="input input-secondary input-sm"
              onChange={(event) => {
                setQuery(event.currentTarget.value);
              }}
              placeholder="Rechercher"
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

          {query ? (
            results.length ? (
              <div className="flex flex-col gap-2">
                {results.map((result) => (
                  <button
                    className="rounded-box -mx-4 flex items-center gap-4 p-2 px-4 text-left hover:bg-neutral"
                    key={result.id}
                    onClick={() => {
                      setLinkTo(
                        persons.find((person) => person.id === result.id),
                      );
                      setQuery("");
                    }}
                  >
                    <PersonRecordMaybe
                      person={persons.find((person) => person.id === result.id)}
                    />
                  </button>
                ))}
              </div>
            ) : debouncedQuery.length > 1 ? (
              <i>Aucun résultat</i>
            ) : null
          ) : suggestions.length ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">Suggestions</h3>

              {suggestions.map((suggestion) => (
                <button
                  className="rounded-box -mx-4 flex items-center gap-4 p-2 px-4 text-left hover:bg-neutral"
                  key={suggestion.id}
                  onClick={() => {
                    setLinkTo(
                      persons.find((person) => person.id === suggestion.id),
                    );
                    setQuery("");
                  }}
                >
                  <PersonRecordMaybe
                    person={persons.find(
                      (person) => person.id === suggestion.id,
                    )}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sticky inset-x-0 bottom-0 gap-4 border-t border-base-content/10 bg-base-200 py-6 flex-center">
        <button
          className="btn btn-sm"
          onClick={() => {
            onClose();
          }}
        >
          Fermer
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setShowMergeForm(true);
          }}
        >
          Vérifier
        </button>
      </div>

      <SidePanel
        onClose={() => {
          setShowMergeForm(false);
        }}
        open={showMergeForm}
      >
        {showMergeForm ? (
          <MergeForm
            onClose={() => {
              setShowMergeForm(false);
            }}
            onSubmit={(data) => {
              onSubmit(data, linkTo?.id);
              setShowMergeForm(false);
              setLinkTo(undefined);
            }}
            persons={linkTo ? [checkingPerson, linkTo] : [checkingPerson]}
          />
        ) : null}
      </SidePanel>
    </>
  );
}
