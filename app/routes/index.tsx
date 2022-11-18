import {
  Form,
  Link,
  NavLink,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  addPlayer,
  cancelDraw,
  createDraw,
  deleteDraw,
  deletePlayer,
  getDraw,
  makeDraw,
} from "~/models/draw.server";
import EntitySelector from "~/components/entitySelector";
import { createPerson, getPersons, updatePerson } from "~/models/person.server";
import PersonModalForm from "~/components/personModalForm";
import { Listbox } from "@headlessui/react";

type SortBy = "date" | "firstName" | "lastName";

const year = new Date().getFullYear();

const sortByOptions: Record<SortBy, string> = {
  date: "Date d'ajout",
  firstName: "Prénom",
  lastName: "Nom",
};

export async function loader() {
  const draw = await getDraw({ year });
  const persons = await getPersons();

  return json({ draw, persons });
}

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();

  switch (formData.get("_action")) {
    case "create":
      await createDraw({ year });
      break;

    case "delete":
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
      });
      break;
  }

  return redirect("/");
};

function Players({
  draw,
  sortBy,
}: {
  draw: NonNullable<Awaited<ReturnType<typeof getDraw>>>;
  sortBy: SortBy;
}) {
  const { drawn } = draw;
  let { players } = draw;

  if (players.length === 0) {
    return <span> Nobody for now :(</span>;
  }

  switch (sortBy) {
    case "firstName": {
      players = players.sort((a, b) =>
        a.person.firstName.localeCompare(b.person.firstName)
      );
      break;
    }
    case "lastName": {
      players = players.sort((a, b) =>
        a.person.lastName.localeCompare(b.person.lastName)
      );
      break;
    }
  }

  return (
    <table className="-z-10 table w-full">
      <tbody>
        {players.map(({ person, assigned, age }) => (
          <tr key={person.id} className="group hover">
            <td>
              <div className="flex items-center gap-8">
                <div>
                  <div>
                    {`${person.firstName} ${person.lastName}`}{" "}
                    <span className="ml-2 text-sm opacity-50">{age}</span>
                  </div>
                  <div className="opacity-30">{person.email}</div>
                </div>
                <NavLink
                  to={`/?showPersonForm=true&personId=${person.id}`}
                  className="btn-ghost btn-circle btn invisible group-hover:visible"
                >
                  <PencilIcon height={16} />
                </NavLink>
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
            <td className="text-right">
              {!drawn && (
                <Form method="post">
                  <input type="hidden" name="personId" value={person.id} />

                  <button
                    className="btn-ghost btn-sm btn-circle btn"
                    type="submit"
                    name="_action"
                    value="deletePlayer"
                  >
                    <XMarkIcon height={24} />
                  </button>
                </Form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Index() {
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draw, persons } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const addPlayerFormRef = useRef<HTMLFormElement>(null);

  const isSelected = (id: string) => {
    return Boolean(draw?.players.find((player) => player.person.id === id));
  };

  return (
    <>
      <div className="navbar bg-neutral text-neutral-content">
        <div className="container mx-auto px-4">
          <Link to="/" className="btn-ghost btn text-xl normal-case">
            En Avent la prière !
          </Link>
        </div>
      </div>
      <main className="container mx-auto mb-20 px-4">
        {draw ? (
          <div className="mt-8">
            <div className="align-items mb-4 flex items-end gap-4">
              {!draw.drawn && (
                <>
                  <Form method="post" ref={addPlayerFormRef}>
                    <input type="hidden" name="_action" value="addPlayer" />

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
                            <br />
                            <span className="opacity-30">{person.email}</span>
                          </span>
                          <span>
                            {isSelected(person.id) && <CheckIcon height={18} />}
                          </span>
                        </div>
                      )}
                      onSelect={(person) => {
                        if (!addPlayerFormRef.current) {
                          return;
                        }

                        const formData = new FormData(addPlayerFormRef.current);
                        formData.set("personId", person.id);

                        if (isSelected(person.id)) {
                          formData.set("_action", "deletePlayer");
                        } else {
                          formData.set("age", person.age);
                        }

                        submit(formData, { method: "post" });
                      }}
                    />
                  </Form>

                  <div
                    className="tooltip tooltip-right"
                    data-tip="Créer une nouvelle personne"
                  >
                    <NavLink className="btn-circle btn" to="/?showPersonForm">
                      <PlusIcon height={24} />
                    </NavLink>
                  </div>
                </>
              )}

              <div className="ml-auto gap-4 flex-center">
                <div className="opacity-50">
                  {draw.players.length} participant
                  {draw.players.length > 1 && "s"}
                </div>

                <Listbox
                  value={sortBy}
                  onChange={setSortBy}
                  as="div"
                  className="dropdown dropdown-end"
                >
                  <Listbox.Button
                    as="button"
                    className="btn-sm btn"
                    tabIndex={0}
                  >
                    {sortByOptions[sortBy]}
                    <ChevronDownIcon height={16} className="ml-2" />
                  </Listbox.Button>
                  <Listbox.Options
                    as="ul"
                    className="dropdown-content menu mt-2 w-52 rounded-md bg-base-300 p-2 shadow"
                    tabIndex={0}
                  >
                    {Object.entries(sortByOptions).map(([value, label]) => (
                      <Listbox.Option as="li" key={value} value={value}>
                        <span>{label}</span>
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>
            </div>

            <Players draw={draw} sortBy={sortBy} />

            <Form method="post">
              <div className="mt-20 flex gap-2">
                {draw.drawn ? (
                  <button
                    className="btn"
                    type="submit"
                    name="_action"
                    value="cancelDraw"
                  >
                    Annuler le tirage
                  </button>
                ) : (
                  <button
                    className="btn"
                    type="submit"
                    name="_action"
                    value="makeDraw"
                  >
                    Lancer le tirage
                  </button>
                )}
                <button
                  className="btn-outline btn-error btn ml-auto"
                  type="submit"
                  name="_action"
                  value="delete"
                  onClick={(e) => {
                    if (
                      !window.confirm(
                        "Es-tu sûr de vouloir supprimer le tirage ?"
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  Supprimer le tirage
                </button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="mt-4">
            <Form method="post">
              <button
                className="btn"
                type="submit"
                name="_action"
                value="create"
              >
                Créer le tirage {year}
              </button>
            </Form>
          </div>
        )}
      </main>

      {searchParams.get("showPersonForm") && (
        <PersonModalForm
          edit={Boolean(searchParams.get("personId"))}
          data={
            searchParams.get("personId")
              ? persons.find(
                  (person) => person.id === searchParams.get("personId")
                )
              : undefined
          }
          onClose={() => navigate("/")}
        />
      )}
    </>
  );
}
