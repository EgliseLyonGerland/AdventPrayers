import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useRef } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  addPlayer,
  cancelDraw,
  createDraw,
  deleteDraw,
  deletePlayer,
  getDraw,
  getPersons,
  makeDraw,
} from "~/models/draw.server";
import EntitySelector from "~/components/entitySelector";

const year = new Date().getFullYear();

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
  }

  return redirect("/");
};

function Players({
  draw: { drawn, players },
}: {
  draw: NonNullable<Awaited<ReturnType<typeof getDraw>>>;
}) {
  if (players.length === 0) {
    return <span> Nobody for now :(</span>;
  }

  return (
    <table className=" table w-full">
      <tbody>
        {players.map(({ person, assigned, age }) => (
          <tr key={person.id}>
            <td>
              {`${person.firstName} ${person.lastName}`}{" "}
              <span className="ml-2 opacity-50">{age}</span>
            </td>
            <td>
              {assigned && (
                <>
                  {`${assigned.firstName} ${assigned.lastName}`}
                  <span className="ml-2 opacity-50">{age}</span>
                </>
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
            <Form method="post" className="mb-4" ref={addPlayerFormRef}>
              <input type="hidden" name="_action" value="addPlayer" />

              {!draw.drawn && (
                <EntitySelector
                  name="Ajouter une personne"
                  items={persons}
                  keyProp="id"
                  filterBy={["firstName", "lastName"]}
                  renderItem={(person) => (
                    <div className="flex items-center justify-between whitespace-nowrap">
                      <span>
                        {person.firstName} {person.lastName}
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
              )}
            </Form>

            <Players draw={draw} />

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
    </>
  );
}
