import type { Person } from "@prisma/client";
import { prisma } from "~/db.server";

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
