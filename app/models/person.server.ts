import type { Person, Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export function getPersons() {
  return prisma.person.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      age: true,
      bio: true,
      picture: true,
      exclude: true,
    },
  });
}

export function findSimilarPerson(where: Prisma.PersonWhereInput) {
  return prisma.person.findFirst({
    select: { id: true },
    where: where,
  });
}

export function createPerson(
  data: Pick<
    Person,
    "firstName" | "lastName" | "age" | "gender" | "email" | "bio" | "picture"
  > & {
    exclude: string[];
  },
) {
  return prisma.person.create({
    data: {
      ...data,
      exclude: {
        connect: data.exclude.map((personId) => ({
          id: personId,
        })),
      },
    },
    select: {
      id: true,
      age: true,
    },
  });
}

export function updatePerson({
  id,
  exclude,
  ...data
}: Partial<
  Pick<
    Person,
    | "id"
    | "firstName"
    | "lastName"
    | "age"
    | "gender"
    | "email"
    | "bio"
    | "picture"
  > & {
    exclude?: string[];
  }
>) {
  return prisma.person.update({
    where: { id },
    data: exclude
      ? {
          ...data,
          exclude: {
            connect: exclude.map((personId) => ({
              id: personId,
            })),
          },
        }
      : data,
  });
}
