import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import { prisma } from "~/db.server";

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

export async function loader() {
  return json(await getDraw());
}

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();

  switch (formData.get("_action")) {
    case "create":
      await prisma.draw.create({ data: { year } });
      break;

    case "delete":
      await prisma.draw.delete({ where: { year } });
  }

  return redirect("/");
};

export default function Index() {
  const draw = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold">En Avent la prière ! {year}</h1>
      <Form method="post">
        {draw ? (
          <div className="mt-4 grid">
            {draw?.players.length
              ? draw.players.map(({ person, assigned }) => (
                  <div key={person.id}>
                    <b>
                      {person.firstName} {person.lastName}
                    </b>
                    {"=>"} {assigned.firstName} {assigned.lastName}
                  </div>
                ))
              : "Nobody"}

            <button
              className="btn-error btn"
              type="submit"
              name="_action"
              value="delete"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <button className="btn" type="submit" name="_action" value="create">
              Create the draw
            </button>
          </div>
        )}
      </Form>
    </main>
  );
}
