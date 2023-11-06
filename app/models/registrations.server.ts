import { type Registration } from "@prisma/client";

import { prisma } from "~/db.server";
import { getCurrentYear } from "~/utils";

export function register(
  data: Omit<Registration, "id" | "drawYear" | "registeredAt">,
) {
  return prisma.registration.create({
    data: { ...data, drawYear: getCurrentYear() },
  });
}

export function getRegistrations(year: number) {
  return prisma.registration.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      age: true,
      bio: true,
      picture: true,
    },
    where: { drawYear: year },
  });
}

export function deleteRegistration(id: string) {
  return prisma.registration.delete({
    where: { id },
  });
}
