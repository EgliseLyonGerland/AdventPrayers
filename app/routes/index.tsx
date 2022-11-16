import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import PersonSelector from "~/components/personSelector";
import { useRef } from "react";
import {
  addPerson,
  cancelDraw,
  createDraw,
  deleteDraw,
  getDraw,
  getPersons,
  makeDraw,
} from "~/models/draw.server";

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
      await createDraw;
      break;

    case "delete":
      await deleteDraw({ year });
      break;

    case "addPerson":
      addPerson({ year, id: `${formData.get("id")}` });
      break;

    case "makeDraw":
      makeDraw({ year });
      break;

    case "cancelDraw":
      cancelDraw({ year });
      break;
  }

  return redirect("/");
};

function Players({
  players,
}: {
  players: NonNullable<Awaited<ReturnType<typeof getDraw>>>["players"];
}) {
  if (players.length === 0) {
    return <span> Nobody for now :(</span>;
  }

  return (
    <table className="table w-full">
      <tbody>
        {players.map(({ person, assigned }) => (
          <tr key={person.id}>
            <td>{`${person.firstName} ${person.lastName}`}</td>
            <td>{assigned && `${assigned.firstName} ${assigned.lastName}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Index() {
  const { draw, persons } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const addPersonFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <div className="navbar bg-neutral text-neutral-content">
        <Link to="/" className="btn-ghost btn text-xl normal-case">
          En Avent la prière !
        </Link>
      </div>
      <main className="container mx-auto px-4">
        {draw ? (
          <div className="mt-8">
            <Players players={draw.players} />

            <div className="mt-4">
              <Form method="post" ref={addPersonFormRef}>
                <input type="hidden" name="_action" value="addPerson" />

                {!draw.drawn && (
                  <PersonSelector
                    persons={persons}
                    onSelect={(person) => {
                      if (!addPersonFormRef.current) {
                        return;
                      }

                      const formData = new FormData(addPersonFormRef.current);
                      formData.set("id", person.id);

                      submit(formData, { method: "post" });
                    }}
                  ></PersonSelector>
                )}
              </Form>
            </div>

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
