import { type Registration as RegistrationType } from "@prisma/client";

import { prisma } from "~/db.server";
import { getCurrentYear } from "~/utils";

export type Registration = RegistrationType;

export function register(
  data: Omit<
    Registration,
    "id" | "drawYear" | "registeredAt" | "approved" | "personId"
  >,
) {
  return prisma.registration.create({
    data: { ...data, drawYear: getCurrentYear() },
  });
}

export function getRegistration(id: string) {
  return prisma.registration.findUnique({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      age: true,
      bio: true,
      picture: true,
      approved: true,
      personId: true,
    },
    where: { id },
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
      approved: true,
      personId: true,
    },
    where: { drawYear: year },
  });
}

export function countPendingRegistrations(year: number) {
  return prisma.registration.count({
    where: { drawYear: year, approved: false },
  });
}

export function approveRegistration(id: string, personId: string) {
  return prisma.registration.update({
    data: {
      approved: true,
      personId,
    },
    where: { id },
  });
}

export function deleteRegistration(id: string) {
  return prisma.registration.delete({
    where: { id },
  });
}
