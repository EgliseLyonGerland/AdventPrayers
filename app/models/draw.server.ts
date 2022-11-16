import type { Draw, Person } from "@prisma/client";
import { prisma } from "~/db.server";

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

export function getPersons() {
  return prisma.person.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

export function createDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.create({ data: { year } });
}

export function deleteDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.delete({ where: { year } });
}

export async function addPerson({
  year,
  id,
}: Pick<Draw, "year"> & Pick<Person, "id">) {
  return prisma.draw.update({
    where: { year },
    data: {
      players: {
        create: {
          personId: id,
        },
      },
    },
  });
}

export async function makeDraw({ year }: Pick<Draw, "year">) {
  const draw = await getDraw({ year });

  if (!draw) {
    return;
  }

  return prisma.draw.update({
    where: { year },
    data: {
      drawn: true,
      players: {
        updateMany: draw.players.map((player) => ({
          where: { personId: player.person.id },
          data: { assignedId: player.person.id },
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
