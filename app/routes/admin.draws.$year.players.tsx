import { Listbox } from "@headlessui/react";
import {
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  type Params,
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
  updateDraw,
  updatePlayerAge,
} from "~/models/draw.server";
import { createPerson, getPersons, updatePerson } from "~/models/person.server";
import { pluralize } from "~/utils";
import { resolveGroup } from "~/utils/groups";

type SortBy = "date" | "firstName" | "lastName";
type GroupBy = "player" | "age" | "group";

interface SearchParams {
  showPersonForm: boolean;
  showSettings: boolean;
  personId: string | null;
  sortBy: SortBy;
  groupBy: GroupBy;
}

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
  values: Partial<SearchParams> = {},
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });
  const persons = await getPersons();
  return json({ draw, persons, drawExists: true });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
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

    case "newPerson": {
      const person = await createPerson({
        firstName: `${formData.get("firstName")}`,
        lastName: `${formData.get("lastName")}`,
        email: `${formData.get("email")}`,
        gender: `${formData.get("gender")}`,
        age: `${formData.get("age")}`,
        bio: null,
        picture: null,
        exclude: formData.getAll("exclude[]").map(String),
      });

      await addPlayer({ year, id: person.id, age: person.age });
      break;
    }

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
    `/admin/draws/${year}/players?${toQueryString(url.searchParams, {
      showPersonForm: false,
      showSettings: false,
      personId: null,
    })}`,
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
      a.person[sortBy].localeCompare(b.person[sortBy]),
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
      <table className="table table-zebra z-0 w-full rounded-xl text-base">
        {groups.map((group) => (
          <Fragment key={group.name}>
            {group.name ? (
              <tbody className="group">
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-between pb-4 pt-8 group-first:pt-0">
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
            ) : null}

            <tbody>
              {group.players.map(({ person, assigned, age }) => (
                <tr className="group hover" key={person.id}>
                  <td className="align-middle">
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
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-8">
                      <div>
                        <div>
                          {`${person.firstName} ${person.lastName}`}{" "}
                          <span className="ml-2 text-base-content/50">
                            {age}
                          </span>
                        </div>
                        <div className="flex gap-2 text-base-content/30">
                          <span>{person.email}</span>
                          {person.exclude.length > 0 ? (
                            <>
                              <span>•</span>
                              <span
                                className="tooltip tooltip-secondary"
                                data-tip={person.exclude
                                  .map(
                                    (item) =>
                                      `${item.firstName} ${item.lastName}`,
                                  )
                                  .join(`, `)}
                              >
                                {person.exclude.length}{" "}
                                {pluralize("exclusion", person.exclude)}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <button
                        className="btn btn-circle btn-ghost invisible group-hover:visible"
                        onClick={() => onNewPersonClick(person.id)}
                      >
                        <PencilIcon height={16} />
                      </button>
                    </div>
                  </td>
                  <td className="w-full">
                    {assigned ? (
                      <span className="inline-block rounded-md bg-neutral px-2 py-1 text-neutral-content">
                        {`${assigned.firstName} ${assigned.lastName}`}
                        <span className="ml-2 opacity-50">{assigned.age}</span>
                      </span>
                    ) : null}
                  </td>
                  {!drawn ? (
                    <td className="text-right align-middle">
                      <button
                        className="btn btn-circle btn-ghost"
                        onClick={() => onDeletePlayerClick(person.id)}
                      >
                        <XMarkIcon className="h-6" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </Fragment>
        ))}
      </table>

      {players.length < 3 ? (
        <div className="hero mt-4 bg-base-200 p-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold">
                C’est {missing < 3 ? "toujours" : null} un peu vide ici !
              </h1>
              <p className="py-6 text-lg opacity-70 wrap-balance">
                Ajoute
                {missing === 3
                  ? " au moins 3 participants "
                  : ` encore ${missing} ${pluralize("participant", missing)} `}
                pour pouvoir lancer le tirage.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draw, persons, drawExists } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const year = getYearParam(useParams());

  const isSelected = (id: string) =>
    Boolean(draw?.players.find((player) => player.person.id === id));

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
      { replace: true },
    );
  };

  return (
    <>
      <div className="w-full max-w-7xl">
        {draw ? (
          <>
            <div className="mb-4 flex items-center gap-4">
              {!draw.drawn ? (
                <>
                  <EntitySelector
                    className="z-10"
                    filterBy={["firstName", "lastName"]}
                    items={persons}
                    keyProp="id"
                    name="Ajouter un participant"
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
                    renderItem={(person) => (
                      <div className="flex items-center justify-between whitespace-nowrap">
                        <span>
                          {person.firstName} {person.lastName}
                          <span className="ml-2 opacity-50">{person.age}</span>
                          <div className="opacity-30">{person.email}</div>
                        </span>
                        <span>
                          {isSelected(person.id) ? (
                            <CheckIcon height={18} />
                          ) : null}
                        </span>
                      </div>
                    )}
                  />

                  <div
                    className="tooltip"
                    data-tip="Créer une nouvelle personne"
                  >
                    <NavLink
                      className="btn btn-circle btn-sm"
                      to={`?${toQueryString(searchParams, {
                        showPersonForm: true,
                      })}`}
                    >
                      <PlusIcon className="h-4" />
                    </NavLink>
                  </div>
                </>
              ) : null}

              <div className="ml-auto opacity-50">
                {draw.players.length}{" "}
                {pluralize("participant", draw.players.length)}
              </div>

              {!draw.drawn && draw.players.length > 2 ? (
                <Form method="post">
                  <button
                    className="btn btn-secondary btn-sm"
                    name="_action"
                    type="submit"
                    value="makeDraw"
                  >
                    Lancer le tirage
                  </button>
                </Form>
              ) : null}

              <Listbox
                as="div"
                className="dropdown dropdown-end dropdown-bottom z-10"
              >
                <Listbox.Button
                  as="button"
                  className="btn btn-circle btn-ghost btn-sm"
                  tabIndex={0}
                >
                  <EllipsisVerticalIcon className="h-4" />
                </Listbox.Button>
                <Listbox.Options
                  as="ul"
                  className="menu dropdown-content mt-2 w-52 rounded-md border border-base-content/20 bg-base-300 p-2 shadow"
                >
                  <li className="menu-title">
                    <span>Organiser</span>
                  </li>

                  {groupByOptions.map((value) => (
                    <Listbox.Option
                      as="li"
                      disabled={settings.groupBy === value}
                      key={value}
                      onClick={() => {
                        go({ groupBy: value });
                      }}
                      value={value}
                    >
                      <span className="flex justify-between">
                        {groupByLabels[value]}
                        {settings.groupBy === value ? (
                          <CheckIcon height={18} />
                        ) : null}
                      </span>
                    </Listbox.Option>
                  ))}

                  <div className="divider" />
                  <li className="menu-title">
                    <span>Ordonner</span>
                  </li>
                  {sortByOptions.map((value) => (
                    <Listbox.Option
                      as="li"
                      disabled={settings.sortBy === value}
                      key={value}
                      onClick={() => {
                        go({ sortBy: value });
                      }}
                      value={value}
                    >
                      <span className="flex justify-between">
                        {sortByLabels[value]}
                        {settings.sortBy === value ? (
                          <CheckIcon height={18} />
                        ) : null}
                      </span>
                    </Listbox.Option>
                  ))}

                  <div className="divider" />
                  <li className="menu-title">
                    <span>Tirage</span>
                  </li>
                  <Listbox.Option
                    as="li"
                    onClick={() => {
                      go({ showSettings: true });
                    }}
                    value="showSettings"
                  >
                    <span>Configurer</span>
                  </Listbox.Option>
                  <Listbox.Option
                    as="li"
                    className={!draw.drawn ? "disabled" : ""}
                    disabled={!draw.drawn}
                    onClick={() => {
                      const formData = new FormData();
                      formData.set("_action", "cancelDraw");

                      submit(formData, { method: "post" });
                    }}
                    value="cancelDraw"
                  >
                    <span>Annuler</span>
                  </Listbox.Option>
                  <Listbox.Option
                    as="li"
                    className={!drawExists ? "disabled" : ""}
                    disabled={!drawExists}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Es-tu sûr de vouloir supprimer le tirage ?",
                        )
                      ) {
                        const formData = new FormData();
                        formData.set("_action", "deleteDraw");

                        submit(formData, { method: "post" });
                      }
                    }}
                    value="deleteDraw"
                  >
                    <span className="text-error">Supprimer</span>
                  </Listbox.Option>
                </Listbox.Options>
              </Listbox>
            </div>

            <Players
              draw={draw}
              groupBy={settings.groupBy}
              onDeletePlayerClick={(personId) => {
                const formData = new FormData();
                formData.set("_action", "deletePlayer");
                formData.set("personId", personId);

                submit(formData, { method: "post" });
              }}
              onNewPersonClick={(personId) => {
                go({ showPersonForm: true, personId });
              }}
              sortBy={settings.sortBy}
            />
          </>
        ) : (
          <div className="mt-4">
            <Form method="post">
              <button
                className="btn"
                name="_action"
                type="submit"
                value="createDraw"
              >
                Créer le tirage {year}
              </button>
            </Form>
          </div>
        )}
      </div>

      <dialog
        className="modal"
        onClose={() => {
          go({ showSettings: false });
        }}
        open={settings.showSettings}
      >
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">Paramètres du tirage</h3>

          <form method="dialog">
            <button className="btn btn-circle btn-sm absolute right-4 top-4">
              <XMarkIcon height={16} />
            </button>
          </form>

          <Form method="post">
            <div className="form-control mb-4">
              <label className="label" htmlFor="ages">
                <span className="label-text font-bold">Tranches d’age</span>
              </label>
              <input
                className="input input-bordered"
                defaultValue={draw?.ages}
                name="ages"
                type="text"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label" htmlFor="groups">
                <span className="label-text font-bold">Groupes d’age</span>
              </label>
              <input
                className="input input-bordered"
                defaultValue={draw?.groups}
                name="groups"
                type="text"
              />
            </div>

            <div className="modal-action mt-8">
              <button
                className="btn btn-secondary btn-outline"
                name="_action"
                type="submit"
                value={"saveSettings"}
              >
                Enregistrer
              </button>
            </div>
          </Form>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button />
        </form>
      </dialog>

      {settings.showPersonForm ? (
        <PersonModalForm
          data={
            settings.personId
              ? persons.find((person) => person.id === settings.personId)
              : undefined
          }
          edit={Boolean(settings.personId)}
          onClose={() => {
            go({ showPersonForm: false, personId: null });
          }}
          persons={persons}
        />
      ) : null}
    </>
  );
}
