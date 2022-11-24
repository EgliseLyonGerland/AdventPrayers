import { Dialog, Listbox } from "@headlessui/react";
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
  getDefaultDraw,
  getDraw,
  makeDraw,
  updateDraw,
  updatePlayerAge,
} from "~/models/draw.server";
import { createPerson, getPersons, updatePerson } from "~/models/person.server";
import { pluralize } from "~/utils";
import { resolveGroup } from "~/utils/groups";

type LoaderData = {
  draw: Awaited<ReturnType<typeof getDraw>>;
  persons: Awaited<ReturnType<typeof getPersons>>;
  drawExists: boolean;
};

type SortBy = "date" | "firstName" | "lastName";
type GroupBy = "player" | "age" | "group";

type SearchParams = {
  showPersonForm: boolean;
  showSettings: boolean;
  personId: string | null;
  sortBy: SortBy;
  groupBy: GroupBy;
};

const sortByOptions: SortBy[] = ["date", "firstName", "lastName"];

const sortByLabels: Record<SortBy, string> = {
  date: "Par date d'ajout",
  firstName: "Par prénom",
  lastName: "Par nom",
};

const groupByOptions: GroupBy[] = ["player", "age", "group"];

const groupByLabels: Record<GroupBy, string> = {
  player: "Par participant",
  age: "Par tranche d'age",
  group: "Par groupe d'age",
};

const searchParamsDefaults: SearchParams = {
  showPersonForm: false,
  showSettings: false,
  personId: null,
  sortBy: "date",
  groupBy: "player",
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

  if (!draw) {
    return json({
      draw: getDefaultDraw({ year }),
      persons,
      drawExists: false,
    });
  }

  return json({ draw, persons, drawExists: true });
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

    case "saveSettings":
      await updateDraw({
        year,
        ages: `${formData.get("ages")}`,
        groups: `${formData.get("groups")}`,
      });
  }

  const url = new URL(request.url);

  return redirect(
    `/draws/${year}/players?${toQueryString(url.searchParams, {
      showPersonForm: false,
      showSettings: false,
      personId: null,
    })}`
  );
};

function Players({
  draw,
  sortBy,
  groupBy,
  onNewPersonClick,
  onDeletePlayerClick,
}: {
  draw: NonNullable<Awaited<ReturnType<typeof getDraw>>>;
  sortBy: SortBy;
  groupBy: GroupBy;
  onNewPersonClick: (id: string) => void;
  onDeletePlayerClick: (id: string) => void;
}) {
  const { drawn } = draw;
  let { players } = draw;

  if (sortBy !== "date") {
    players = players.sort((a, b) =>
      a.person[sortBy].localeCompare(b.person[sortBy])
    );
  }

  let groups: { name: string | null; players: typeof players }[] = [
    { name: null, players },
  ];

  if (groupBy === "age" || groupBy === "group") {
    groups = players
      .sort((a, b) => parseInt(a.age) - parseInt(b.age))
      .reduce<typeof groups>((acc, player) => {
        const name =
          groupBy === "age"
            ? player.age
            : resolveGroup(player.age, draw.groups).label;

        if (acc[acc.length - 1]?.name !== name) {
          acc.push({ name, players: [] });
        }

        acc[acc.length - 1].players.push(player);

        return acc;
      }, []);
  }

  const missing = 3 - players.length;

  return (
    <>
      <table className="table-zebra z-0 table w-full">
        {groups.map((group) => (
          <Fragment key={group.name}>
            {group.name && (
              <tbody className="group">
                <tr>
                  <td colSpan={3}>
                    <div className="flex justify-between border-b-[1px] border-b-white/10 pb-4 pt-8 group-first:pt-0">
                      <h2 className="inline text-xl font-bold">
                        {group.name} ans
                      </h2>

                      <span className="opacity-30">
                        {group.players.length}{" "}
                        {pluralize("participant", draw.players)}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}

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
                        <div className="flex gap-2 text-sm text-white/30">
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
                        <span className="ml-2 text-sm opacity-50">
                          {assigned.age}
                        </span>
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
          </Fragment>
        ))}
      </table>

      {players.length < 3 && (
        <div className="hero mt-4 bg-base-200 p-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold">
                C'est {missing < 3 && "toujours"} un peu vide ici !
              </h1>
              <p className="py-6 text-lg opacity-70">
                Ajoute
                {missing === 3
                  ? " au moins 3 participants "
                  : ` encore ${missing} ${pluralize("participant", missing)} `}
                pour pouvoir lancer le tirage.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draw, persons, drawExists } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  const year = getYearParam(useParams());

  const isSelected = (id: string) => {
    return Boolean(draw?.players.find((player) => player.person.id === id));
  };

  const settings: SearchParams = {
    showPersonForm: searchParams.get("showPersonForm") === "true",
    showSettings: searchParams.get("showSettings") === "true",
    personId: searchParams.get("personId"),
    sortBy: (searchParams.get("sortBy") as SortBy) || "date",
    groupBy: (searchParams.get("groupBy") as GroupBy) || null,
  };

  const go = (params: Partial<SearchParams>) => {
    navigate(
      { search: toQueryString(searchParams, params) },
      { replace: true }
    );
  };

  return (
    <div className="container mx-auto">
      {draw ? (
        <>
          {!draw.drawn && (
            <div className="mb-4 flex items-center gap-4">
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

              <div className="tooltip" data-tip="Créer une nouvelle personne">
                <NavLink
                  className="btn-sm btn-circle btn"
                  to={`?${toQueryString(searchParams, {
                    showPersonForm: true,
                  })}`}
                >
                  <PlusIcon height={24} />
                </NavLink>
              </div>

              {draw && (
                <>
                  <div className="ml-auto opacity-50">
                    {draw.players.length}{" "}
                    {pluralize("participant", draw.players.length)}
                  </div>

                  {draw.players.length > 2 && (
                    <Form method="post">
                      <button
                        className="btn-accent btn-sm btn"
                        type="submit"
                        name="_action"
                        value="makeDraw"
                      >
                        Lancer le tirage
                      </button>
                    </Form>
                  )}

                  <Listbox as="div" className="dropdown-left dropdown">
                    <Listbox.Button
                      as="button"
                      className="btn-ghost btn-circle btn"
                      tabIndex={0}
                    >
                      <EllipsisVerticalIcon height={24} />
                    </Listbox.Button>
                    <Listbox.Options
                      as="ul"
                      className="dropdown-content menu rounded-box w-52 bg-base-300 p-2 shadow"
                      tabIndex={0}
                    >
                      <li className="menu-title">
                        <span>Organiser</span>
                      </li>

                      {groupByOptions.map((value) => (
                        <Listbox.Option
                          as="li"
                          key={value}
                          value={value}
                          disabled={settings.groupBy === value}
                          onClick={() => {
                            go({ groupBy: value });
                          }}
                        >
                          <span className="flex justify-between">
                            {groupByLabels[value]}
                            {settings.groupBy === value && (
                              <CheckIcon height={18} />
                            )}
                          </span>
                        </Listbox.Option>
                      ))}

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
                          onClick={() => {
                            go({ sortBy: value });
                          }}
                        >
                          <span className="flex justify-between">
                            {sortByLabels[value]}
                            {settings.sortBy === value && (
                              <CheckIcon height={18} />
                            )}
                          </span>
                        </Listbox.Option>
                      ))}

                      <div className="divider"></div>
                      <li className="menu-title">
                        <span>Tirage</span>
                      </li>
                      <Listbox.Option
                        as="li"
                        value="showSettings"
                        onClick={() => {
                          go({ showSettings: true });
                        }}
                      >
                        <span>Configurer</span>
                      </Listbox.Option>
                      <Listbox.Option
                        as="li"
                        value="cancelDraw"
                        disabled={!draw.drawn}
                        className={!draw.drawn ? "disabled" : ""}
                        onClick={() => {
                          const formData = new FormData();
                          formData.set("_action", "cancelDraw");

                          submit(formData, { method: "post" });
                        }}
                      >
                        <span>Annuler</span>
                      </Listbox.Option>
                      <Listbox.Option
                        as="li"
                        disabled={!drawExists}
                        className={!drawExists ? "disabled" : ""}
                        value="deleteDraw"
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
                      >
                        <span className="text-error">Supprimer</span>
                      </Listbox.Option>
                    </Listbox.Options>
                  </Listbox>
                </>
              )}
            </div>
          )}

          <Players
            draw={draw}
            sortBy={settings.sortBy}
            groupBy={settings.groupBy}
            onNewPersonClick={(personId) => {
              go({ showPersonForm: true, personId });
            }}
            onDeletePlayerClick={(personId) => {
              const formData = new FormData();
              formData.set("_action", "deletePlayer");
              formData.set("personId", personId);

              submit(formData, { method: "post" });
            }}
          />
        </>
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

      {settings.showSettings && (
        <Dialog
          as="div"
          className="modal-open modal"
          open={true}
          onClose={() => {
            go({ showSettings: false });
          }}
        >
          <Dialog.Panel as="div" className="modal-box">
            <Dialog.Title as="h3" className="mb-4 text-lg font-bold">
              Paramètres du tirage
            </Dialog.Title>

            <button
              className="btn-sm btn-circle btn absolute right-4 top-4"
              onClick={() => {
                go({ showSettings: false });
              }}
            >
              <XMarkIcon height={16} />
            </button>

            <Form method="post">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Tranches d'age</span>
                </label>
                <input
                  type="text"
                  name="ages"
                  className="input-bordered input"
                  defaultValue={draw?.ages}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Groupes d'age</span>
                </label>
                <input
                  type="text"
                  name="groups"
                  className="input-bordered input"
                  defaultValue={draw?.groups}
                />
              </div>

              <div className="modal-action mt-8">
                <button
                  type="submit"
                  name="_action"
                  value={"saveSettings"}
                  className="btn"
                >
                  Enregistrer
                </button>
              </div>
            </Form>
          </Dialog.Panel>
        </Dialog>
      )}

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
            onClose={() => {
              go({ showPersonForm: false, personId: null });
            }}
          />
        </Form>
      )}
    </div>
  );
}
