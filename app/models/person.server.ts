import { type Person as PersonType, type Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export type Person = Omit<PersonType, "createdAt" | "updatedAt">;
export type PersonWithExclude = Person & { exclude: Person[] };

export function getPerson(id: string) {
  return prisma.person.findUnique({
    where: { id },
  });
}

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
      players: true,
    },
  });
}

export function getSimilarPerson(where: Prisma.PersonWhereInput) {
  return prisma.person.findFirst({
    select: { id: true },
    where,
  });
}

export function createPerson(
  data: Pick<
    Person,
    "firstName" | "lastName" | "age" | "gender" | "email" | "bio" | "picture"
  > & {
    exclude?: string[];
  },
) {
  return prisma.person.create({
    data: {
      ...data,
      exclude: {
        connect: (data.exclude || []).map((personId) => ({
          id: personId,
        })),
      },
    },
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

export function updatePerson(
  id: string,
  {
    exclude,
    ...data
  }: Partial<
    Pick<
      Person,
      "firstName" | "lastName" | "age" | "gender" | "email" | "bio" | "picture"
    > & {
      exclude: string[];
    }
  >,
) {
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
