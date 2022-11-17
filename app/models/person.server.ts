import type { Person } from "@prisma/client";
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
    },
  });
}

export function createPerson(
  data: Pick<Person, "firstName" | "lastName" | "age" | "gender" | "email">
) {
  return prisma.person.create({
    data,
    select: {
      id: true,
      age: true,
    },
  });
}

export function updatePerson({
  id,
  ...data
}: Pick<Person, "id" | "firstName" | "lastName" | "age" | "gender" | "email">) {
  return prisma.person.update({
    where: { id },
    data,
  });
}
