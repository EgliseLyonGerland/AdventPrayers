import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import PersonSelector from "~/components/personSelector";
import { useRef } from "react";

const year = new Date().getFullYear();

async function getDraw() {
  return prisma.draw.findUnique({
    where: {
      year,
    },
    select: {
      year: true,
      players: {
        select: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assigned: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

async function getPersons() {
  return prisma.person.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

export async function loader() {
  const draw = await getDraw();
  const persons = await getPersons();

  return json({ draw, persons });
}

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();

  switch (formData.get("_action")) {
    case "create":
      await prisma.draw.create({ data: { year } });
      break;

    case "delete":
      await prisma.draw.delete({ where: { year } });
      break;

    case "addPerson":
      const draw = await prisma.draw.findUnique({
        where: { year },
        select: { players: { select: { person: { select: { id: true } } } } },
      });

      if (!draw) {
        break;
      }

      const personId = `${formData.get("id")}`;

      if (!personId) {
        break;
      }

      await prisma.player.create({
        data: {
          drawYear: year,
          personId,
        },
      });
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
            <td>
              {`${person.firstName} ${person.lastName}`}
              {assigned && `=> ${assigned.firstName} ${assigned.lastName}`}
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
              </Form>
            </div>

            <div className="mt-16 flex">
              <Form method="post">
                <button
                  className="btn-error btn"
                  type="submit"
                  name="_action"
                  value="delete"
                >
                  Delete the draw
                </button>
              </Form>
            </div>
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
                Create the draw
              </button>
            </Form>
          </div>
        )}
      </main>
    </>
  );
}
