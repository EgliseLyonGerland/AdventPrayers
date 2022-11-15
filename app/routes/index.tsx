import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";

// const year = new Date().getFullYear();
const year = 2021;

export async function loader() {
  const draw = await prisma.draw.findUnique({
    where: { year },
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

  return json({ draw });
}

export default function Index() {
  const { draw } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold">En Avent la prière ! {year}</h1>

      <div className="mt-4 grid">
        {draw?.players.map(({ person, assigned }) => (
          <div key={person.id}>
            <b>
              {person.firstName} {person.lastName}
            </b>{" "}
            {"=>"} {assigned.firstName} {assigned.lastName}
          </div>
        ))}
      </div>
    </main>
  );
}
