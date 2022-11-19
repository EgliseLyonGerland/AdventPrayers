import { Listbox } from "@headlessui/react";
import {
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  Form,
  NavLink,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { Fragment } from "react";
import invariant from "tiny-invariant";

import EntitySelector from "~/components/entitySelector";
import PersonModalForm from "~/components/personModalForm";
import {
  addPlayer,
  cancelDraw,
  createDraw,
  deleteDraw,
  deletePlayer,
  getDraw,
  makeDraw,
  updatePlayerAge,
} from "~/models/draw.server";
import { createPerson, getPersons, updatePerson } from "~/models/person.server";
import { pluralize } from "~/utils";

type LoaderData = {
  draw: Awaited<ReturnType<typeof getDraw>>;
  persons: Awaited<ReturnType<typeof getPersons>>;
};

type SortBy = "date" | "firstName" | "lastName";

type SearchParams = {
  showPersonForm: boolean;
  personId: string | null;
  sortBy: SortBy;
  groupByAge: boolean;
};

const sortByOptions: SortBy[] = ["date", "firstName", "lastName"];

const sortByLabels: Record<SortBy, string> = {
  date: "Par date d'ajout",
  firstName: "Par prénom",
  lastName: "Par nom",
};

const searchParamsDefaults: SearchParams = {
  showPersonForm: false,
  personId: null,
  sortBy: "date",
  groupByAge: false,
};

function toQueryString(
  params: URLSearchParams,
  values: Partial<SearchParams> = {}
) {
  const searchParams = new URLSearchParams(params);

  let key: keyof SearchParams;
  for (key in values) {
    if (searchParamsDefaults[key] === values[key]) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, `${values[key]}`);
    }
  }

  return `${searchParams}`;
}

function getYearParam(params: Params): number {
  invariant(params.year, `Year is required`);
  const year = Number(params.year);
  invariant(Number.isInteger(year), "Year must be a integer");

  return year;
}

export const loader: LoaderFunction = async ({ params }) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });
  const persons = await getPersons();

  return json({ draw, persons });
};

export const action: ActionFunction = async ({ request, params }) => {
  let formData = await request.formData();
  const year = getYearParam(params);

  switch (formData.get("_action")) {
    case "createDraw":
      await createDraw({ year });
      break;

    case "deleteDraw":
      await deleteDraw({ year });
      break;

    case "addPlayer":
      await addPlayer({
        year,
        id: `${formData.get("personId")}`,
        age: `${formData.get("age")}`,
      });
      break;

    case "deletePlayer":
      await deletePlayer({
        year,
        id: `${formData.get("personId")}`,
      });
      break;

    case "makeDraw":
      await makeDraw({ year });
      break;

    case "cancelDraw":
      await cancelDraw({ year });
      break;

    case "newPerson":
      const person = await createPerson({
        firstName: `${formData.get("firstName")}`,
        lastName: `${formData.get("lastName")}`,
        email: `${formData.get("email")}`,
        gender: `${formData.get("gender")}`,
        age: `${formData.get("age")}`,
        exclude: formData.getAll("exclude[]").map(String),
      });

      await addPlayer({ year, id: person.id, age: person.age });
      break;

    case "editPerson":
      await updatePerson({
        id: `${formData.get("id")}`,
        firstName: `${formData.get("firstName")}`,
        lastName: `${formData.get("lastName")}`,
        email: `${formData.get("email")}`,
        gender: `${formData.get("gender")}`,
        age: `${formData.get("age")}`,
        exclude: formData.getAll("exclude[]").map(String),
      });
      await updatePlayerAge({
        year,
        id: `${formData.get("id")}`,
        age: `${formData.get("age")}`,
      });
      break;
  }

  const url = new URL(request.url);

  return redirect(
    `/draws/${year}?${toQueryString(url.searchParams, {
      showPersonForm: false,
      personId: null,
    })}`
  );
};

function Players({
  draw,
  sortBy,
  groupByAge,
  onNewPersonClick,
  onDeletePlayerClick,
}: {
  draw: NonNullable<Awaited<ReturnType<typeof getDraw>>>;
  sortBy: SortBy;
  groupByAge: boolean;
  onNewPersonClick: (id: string) => void;
  onDeletePlayerClick: (id: string) => void;
}) {
  const { drawn } = draw;
  let { players } = draw;

  if (players.length === 0) {
    return <span> Nobody for now :(</span>;
  }

  let groups: { name: string | null; players: typeof players }[] = [
    { name: null, players },
  ];

  if (groupByAge) {
    groups = players
      .sort((a, b) => parseInt(a.age) - parseInt(b.age))
      .reduce<typeof groups>((acc, player) => {
        if (acc[acc.length - 1]?.name !== player.age) {
          acc.push({ name: player.age, players: [] });
        }

        acc[acc.length - 1].players.push(player);

        return acc;
      }, []);
  }

  if (sortBy !== "date") {
    groups = groups.map(({ name, players }) => ({
      name,
      players: players.sort((a, b) =>
        a.person[sortBy].localeCompare(b.person[sortBy])
      ),
    }));
  }

  return (
    <>
      {groups.map((group) => (
        <Fragment key={group.name}>
          {group.name && (
            <div className="mb-4 mt-8 flex justify-between border-b-[1px] border-b-white/10 px-2 pb-4">
              <h2 className="inline text-xl font-bold">{group.name} ans</h2>

              <span className="opacity-30">
                {group.players.length} {pluralize("participant", draw.players)}
              </span>
            </div>
          )}

          <table className="z-0 table w-full">
            <tbody>
              {group.players.map(({ person, assigned, age }) => (
                <tr key={person.id} className="group hover">
                  <td>
                    <div className="flex items-center gap-8">
                      <div>
                        <div>
                          {`${person.firstName} ${person.lastName}`}{" "}
                          <span className="ml-2 text-sm text-white/50">
                            {age}
                          </span>
                        </div>
                        <div className="gap-2 text-sm text-white/30 flex-center">
                          <span>{person.email}</span>
                          {person.exclude.length > 0 && (
                            <>
                              <span>•</span>
                              <span
                                className="tooltip tooltip-accent"
                                data-tip={person.exclude
                                  .map(
                                    (item) =>
                                      `${item.firstName} ${item.lastName}`
                                  )
                                  .join(`, `)}
                              >
                                {person.exclude.length}{" "}
                                {pluralize("exclusion", person.exclude)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={() => onNewPersonClick(person.id)}
                        className="btn-ghost btn-circle btn invisible group-hover:visible"
                      >
                        <PencilIcon height={16} />
                      </div>
                    </div>
                  </td>
                  <td className="w-full">
                    {assigned && (
                      <span className="inline-block rounded-md bg-neutral px-4 py-2">
                        {`${assigned.firstName} ${assigned.lastName}`}
                        <span className="ml-2 text-sm opacity-50">{age}</span>
                      </span>
                    )}
                  </td>
                  {!drawn && (
                    <td className="text-right">
                      <button
                        className="btn-ghost btn-sm btn-circle btn"
                        onClick={() => onDeletePlayerClick(person.id)}
                      >
                        <XMarkIcon height={24} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      ))}
    </>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draw, persons } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  const year = getYearParam(useParams());

  const isSelected = (id: string) => {
    return Boolean(draw?.players.find((player) => player.person.id === id));
  };

  const settings: SearchParams = {
    showPersonForm: searchParams.get("showPersonForm") === "true",
    personId: searchParams.get("personId"),
    sortBy: (searchParams.get("sortBy") as SortBy) || "date",
    groupByAge: searchParams.get("groupByAge") === "true",
  };

  return (
    <>
      <main className="container mx-auto px-4">
        {draw ? (
          <div className="mt-8">
            <div className="align-items mb-4 gap-4 flex-center">
              {!draw.drawn && (
                <>
                  <EntitySelector
                    name="Ajouter un participant"
                    items={persons}
                    keyProp="id"
                    filterBy={["firstName", "lastName"]}
                    renderItem={(person) => (
                      <div className="flex items-center justify-between whitespace-nowrap">
                        <span>
                          {person.firstName} {person.lastName}
                          <span className="ml-2 text-sm opacity-50">
                            {person.age}
                          </span>
                          <div className="opacity-30">{person.email}</div>
                        </span>
                        <span>
                          {isSelected(person.id) && <CheckIcon height={18} />}
                        </span>
                      </div>
                    )}
                    onSelect={(person) => {
                      const formData = new FormData();
                      formData.set("personId", person.id);

                      if (isSelected(person.id)) {
                        formData.set("_action", "deletePlayer");
                      } else {
                        formData.set("_action", "addPlayer");
                        formData.set("age", person.age);
                      }

                      submit(formData, { method: "post" });
                    }}
                  />

                  <div
                    className="tooltip tooltip-right"
                    data-tip="Créer une nouvelle personne"
                  >
                    <NavLink
                      className="btn-sm btn-circle btn"
                      to={`/?${toQueryString(searchParams, {
                        showPersonForm: true,
                      })}`}
                    >
                      <PlusIcon height={24} />
                    </NavLink>
                  </div>
                </>
              )}

              <div className="ml-auto opacity-50">
                {draw.players.length}{" "}
                {pluralize("participant", draw.players.length)}
              </div>

              <Listbox as="div" className="dropdown-left dropdown">
                <Listbox.Button
                  as="button"
                  className="btn-ghost btn-sm btn-circle btn "
                  tabIndex={0}
                >
                  <EllipsisVerticalIcon height={24} />
                </Listbox.Button>
                <Listbox.Options
                  as="ul"
                  className="dropdown-content menu rounded-box w-52  bg-base-300 p-2 shadow"
                  tabIndex={0}
                >
                  <li className="menu-title">
                    <span>Affichage</span>
                  </li>
                  <Listbox.Option
                    as="li"
                    onClick={() =>
                      navigate(
                        {
                          search: toQueryString(searchParams, {
                            groupByAge: !settings.groupByAge,
                          }),
                        },
                        { replace: true }
                      )
                    }
                    value="groupByAge"
                  >
                    <span>
                      Grouper par age
                      {settings.groupByAge && <CheckIcon height={16} />}
                    </span>
                  </Listbox.Option>

                  <div className="divider"></div>
                  <li className="menu-title">
                    <span>Ordonner</span>
                  </li>
                  {sortByOptions.map((value) => (
                    <Listbox.Option
                      as="li"
                      key={value}
                      value={value}
                      disabled={settings.sortBy === value}
                      className={settings.sortBy === value ? "disabled" : ""}
                      onClick={() => {
                        navigate(
                          {
                            search: toQueryString(searchParams, {
                              sortBy: value,
                            }),
                          },
                          { replace: true }
                        );
                      }}
                    >
                      <span className="flex justify-between">
                        {sortByLabels[value]}
                        {settings.sortBy === value && <CheckIcon height={18} />}
                      </span>
                    </Listbox.Option>
                  ))}

                  <div className="divider"></div>
                  <li className="menu-title">
                    <span>Actions</span>
                  </li>
                  <Listbox.Option
                    as="li"
                    onClick={() => {
                      const formData = new FormData();
                      formData.set("_action", "cancelDraw");

                      submit(formData, { method: "post" });
                    }}
                    disabled={!draw.drawn}
                    value="cancelDraw"
                    className={!draw.drawn ? "disabled" : ""}
                  >
                    <span>Annuler le tirage</span>
                  </Listbox.Option>
                  <Listbox.Option
                    as="li"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Es-tu sûr de vouloir supprimer le tirage ?"
                        )
                      ) {
                        const formData = new FormData();
                        formData.set("_action", "deleteDraw");

                        submit(formData, { method: "post" });
                      }
                    }}
                    value="deleteDraw"
                  >
                    <span className="text-error">Supprimer le tirage</span>
                  </Listbox.Option>
                </Listbox.Options>
              </Listbox>
            </div>

            <Players
              draw={draw}
              sortBy={settings.sortBy}
              groupByAge={settings.groupByAge}
              onNewPersonClick={(personId) => {
                navigate({
                  search: toQueryString(searchParams, {
                    showPersonForm: true,
                    personId,
                  }),
                });
              }}
              onDeletePlayerClick={(personId) => {
                const formData = new FormData();
                formData.set("_action", "deletePlayer");
                formData.set("personId", personId);

                submit(formData, { method: "post" });
              }}
            />

            {!draw.drawn && draw.players.length > 2 && (
              <Form method="post">
                <div className="mt-20 gap-2 flex-center">
                  <button
                    className="btn-accent btn"
                    type="submit"
                    name="_action"
                    value="makeDraw"
                  >
                    Lancer le tirage
                  </button>
                </div>
              </Form>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <Form method="post">
              <button
                className="btn"
                type="submit"
                name="_action"
                value="createDraw"
              >
                Créer le tirage {year}
              </button>
            </Form>
          </div>
        )}
      </main>

      {settings.showPersonForm && (
        <Form method="post">
          <PersonModalForm
            edit={Boolean(settings.personId)}
            data={
              settings.personId
                ? persons.find((person) => person.id === settings.personId)
                : undefined
            }
            persons={persons}
            onClose={() =>
              navigate(
                {
                  search: toQueryString(searchParams, {
                    showPersonForm: false,
                    personId: null,
                  }),
                },
                { replace: true }
              )
            }
          />
        </Form>
      )}
    </>
  );
}