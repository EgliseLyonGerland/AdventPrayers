import {
  type Player as PlayerType,
  type Draw as DrawType,
} from "@prisma/client";

import { prisma } from "~/db.server";
import { getCurrentYear } from "~/utils";
import { letsDraw } from "~/utils/draw.server";

import { type Person } from "./person.server";

export type Draw = DrawType & {
  players: Player[];
};

export type Player = Omit<PlayerType, "registeredAt">;

export type GetDraws = NonNullable<Awaited<ReturnType<typeof getDraws>>>;
export type GetDraw = NonNullable<Awaited<ReturnType<typeof getDraw>>>;
export type GetDrawPlayer = GetDraw["players"][number];
export type GetDrawPlayerPerson = GetDrawPlayer["person"];

export function getDraws() {
  return prisma.draw.findMany({ orderBy: { year: "asc" } });
}

export function getCurrentDraw() {
  return getDraw({ year: getCurrentYear() });
}

export function getDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.findUnique({
    where: {
      year,
    },
    select: {
      year: true,
      drawn: true,
      ages: true,
      groups: true,
      players: {
        select: {
          drawYear: true,
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              email: true,
              age: true,
              bio: true,
              picture: true,
              exclude: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  gender: true,
                  email: true,
                  age: true,
                  bio: true,
                  picture: true,
                },
              },
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
              bio: true,
              picture: true,
              exclude: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  gender: true,
                  email: true,
                  age: true,
                  bio: true,
                  picture: true,
                },
              },
            },
          },
          personId: true,
          assignedId: true,
          age: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
      },
    },
  });
}

export async function createDraw({ year }: Pick<Draw, "year">) {
  return prisma.draw.create({ data: { year } });
}

export async function deleteDraw({ year }: Pick<Draw, "year">) {
  await prisma.player.deleteMany({ where: { drawYear: year } });
  return prisma.draw.delete({ where: { year } });
}

export async function updateDraw({
  year,
  ages,
  groups,
}: Pick<Draw, "year" | "ages" | "groups">) {
  return prisma.draw.update({
    where: { year },
    data: { ages, groups },
  });
}

export async function getPlayer(drawYear: number, personId: string) {
  return prisma.player.findUnique({
    where: {
      drawYear_personId: {
        drawYear,
        personId,
      },
    },
  });
}

export async function getPrayerPlayer(drawYear: number, personId: string) {
  return prisma.player.findFirst({
    where: {
      drawYear,
      assignedId: personId,
    },
  });
}

export async function addPlayer({
  year,
  id: personId,
  age,
}: Pick<Draw, "year"> & Pick<Person, "id" | "age">) {
  return prisma.draw.update({
    where: { year },
    data: {
      year,
      players: {
        deleteMany: { personId },
        create: { personId, age },
      },
    },
    include: {
      players: true,
    },
  });
}

export async function updatePlayerAge({
  year,
  id: personId,
  age,
}: Pick<Draw, "year"> & Pick<Person, "id" | "age">) {
  return prisma.player.update({
    where: { drawYear_personId: { drawYear: year, personId } },
    data: { age },
  });
}

export async function deletePlayer({
  year,
  id: personId,
}: Pick<Draw, "year"> & Pick<Person, "id">) {
  return prisma.player.delete({
    where: { drawYear_personId: { drawYear: year, personId } },
  });
}

export async function countPlayers(year: number) {
  return prisma.player.count({
    where: { drawYear: year },
  });
}

export async function makeDraw({ year }: Pick<Draw, "year">) {
  const persons = await prisma.person.findMany({ include: { exclude: true } });

  const currentDraw = await prisma.draw.findUnique({
    where: { year },
    include: { players: true },
  });

  if (!currentDraw || !persons) {
    return;
  }

  const prevDraws = await prisma.draw.findMany({
    where: {
      year: {
        lt: year,
      },
    },
    orderBy: {
      year: "desc",
    },
    include: {
      players: {
        select: {
          personId: true,
          assignedId: true,
          age: true,
          drawYear: true,
        },
      },
    },
  });

  const draw = letsDraw(currentDraw, prevDraws, persons);

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
