import type { Draw, Person } from "@prisma/client";
import { prisma } from "~/db.server";
import { letsDraw } from "~/utils/draw";

export function getDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.findUnique({
    where: {
      year,
    },
    select: {
      year: true,
      drawn: true,
      players: {
        select: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              email: true,
              age: true,
            },
          },
          assigned: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              email: true,
              age: true,
            },
          },
          age: true,
        },
      },
    },
  });
}

export function getPersons() {
  return prisma.person.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      gender: true,
      email: true,
      age: true,
    },
  });
}

export function createDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.create({ data: { year } });
}

export function deleteDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.delete({ where: { year } });
}

export async function addPlayer({
  year,
  id: personId,
  age,
}: Pick<Draw, "year"> & Pick<Person, "id" | "age">) {
  return prisma.draw.update({
    where: { year },
    data: {
      players: {
        create: { personId, age },
      },
    },
  });
}

export async function deletePlayer({
  year,
  id: personId,
}: Pick<Draw, "year"> & Pick<Person, "id">) {
  console.log("deletePlayer", year, personId);

  return prisma.player.delete({
    where: { drawYear_personId: { drawYear: year, personId } },
  });
}

export async function makeDraw({ year }: Pick<Draw, "year">) {
  const persons = await prisma.person.findMany();

  const currentDraw = await prisma.draw.findUnique({
    where: { year },
    select: { players: { select: { personId: true } } },
  });

  if (!currentDraw || !persons) {
    return;
  }

  const prevDraws = (
    await Promise.all(
      [year - 1, year - 2].map((item) =>
        prisma.draw.findUnique({
          where: { year: item },
          select: {
            players: {
              select: { personId: true, assignedId: true, age: true },
            },
          },
        })
      )
    )
  )
    .filter(<T>(item: T): item is NonNullable<T> => item !== null)
    .map((item) => item.players);

  const draw = letsDraw(currentDraw.players, prevDraws, persons);

  return prisma.draw.update({
    where: { year },
    data: {
      drawn: true,
      players: {
        updateMany: currentDraw.players.map((player) => ({
          where: { personId: player.personId },
          data: { assignedId: draw[player.personId] },
        })),
      },
    },
  });
}

export async function cancelDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.update({
    where: { year },
    data: {
      drawn: false,
      players: {
        updateMany: {
          where: {},
          data: {
            assignedId: null,
          },
        },
      },
    },
  });
}
