import type { Draw, Person } from "../draw.server";
import { letsDraw } from "../draw.server";

vi.mock("lodash", () => {
  return {
    shuffle: (entry: unknown) => entry,
  };
});

const persons: Person[] = [
  {
    id: "asa",
    firstName: "Augustin",
    lastName: "Sarran",
    exclude: [],
  },
  {
    id: "vsa",
    firstName: "Violette",
    lastName: "Sarran",
    exclude: [],
  },
  {
    id: "mba",
    firstName: "Madèle",
    lastName: "Bazille",
    exclude: [],
  },
  {
    id: "lba",
    firstName: "Loïs",
    lastName: "Bazille",
    exclude: [],
  },
  {
    id: "lva",
    firstName: "Loïs",
    lastName: "Vang",
    exclude: [],
  },
];

const draw: Draw = {
  groups: "6,10,14,18",
  players: [
    { personId: "asa", age: "6-9" },
    { personId: "mba", age: "6-9" },
    { personId: "lba", age: "6-9" },
    { personId: "lva", age: "6-9" },
    { personId: "vsa", age: "6-9" },
  ],
};

const pastDraws: Draw[] = [
  {
    groups: "6,10,14,18",
    players: [
      { personId: "asa", assignedId: "mba", age: "6-9" },
      { personId: "lba", assignedId: "asa", age: "6-9" },
      { personId: "mba", assignedId: "vsa", age: "6-9" },
      { personId: "vsa", assignedId: "lba", age: "6-9" },
    ],
  },
];

test("letsDraw()", () => {
  expect(letsDraw(draw, [], persons)).toEqual({
    asa: "mba",
    lba: "asa",
    lva: "vsa",
    mba: "lva",
    vsa: "lba",
  });

  expect(letsDraw(draw, pastDraws, persons)).toEqual({
    asa: "lba",
    lba: "lva",
    lva: "vsa",
    mba: "asa",
    vsa: "mba",
  });
});
