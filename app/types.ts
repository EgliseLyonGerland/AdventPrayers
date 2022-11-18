import type * as Prisma from "@prisma/client";

export type Age = "6-9" | "10-13" | "14-17" | "18+";

export type Player = Prisma.Player & {
  age: Age;
};

export type Person = Prisma.Person & {
  age: Age;
};
