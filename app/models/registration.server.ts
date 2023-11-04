import { type Registration } from "@prisma/client";

import { prisma } from "~/db.server";
import { getCurrentYear } from "~/utils";

export function register(
  data: Omit<Registration, "id" | "drawYear" | "registeredAt">,
) {
  return prisma.registration.create({
    data: {
      ...data,
      drawYear: getCurrentYear(),
    },
  });
}

export function getRegiration(year: number) {
  return prisma.registration.findMany({
    where: {
      drawYear: year,
    },
  });
}
