import { type Draw } from "~/models/draw.server";
import { type PersonWithExclude } from "~/models/person.server";

import { letsDraw } from "../draw.server";

vi.mock("lodash", () => ({
  shuffle: (entry: unknown) => entry,
}));

const persons: PersonWithExclude[] = [
  {
    id: "asa",
    firstName: "Augustin",
    lastName: "Sarran",
    email: "",
    gender: "",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
  {
    id: "vsa",
    firstName: "Violette",
    lastName: "Sarran",
    email: "",
    gender: "",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
  {
    id: "mba",
    firstName: "Madèle",
    lastName: "Bazille",
    email: "",
    gender: "",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
  {
    id: "lba",
    firstName: "Loïs",
    lastName: "Bazille",
    email: "",
    gender: "",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
  {
    id: "lva",
    firstName: "Loïs",
    lastName: "Vang",
    email: "",
    gender: "",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
];

const draw: Draw = {
  year: 2023,
  ages: "",
  drawn: false,
  groups: "6,10,14,18",
  players: [
    { personId: "asa", age: "6-9", drawYear: 2023, assignedId: "" },
    { personId: "mba", age: "6-9", drawYear: 2023, assignedId: "" },
    { personId: "lba", age: "6-9", drawYear: 2023, assignedId: "" },
    { personId: "lva", age: "6-9", drawYear: 2023, assignedId: "" },
    { personId: "vsa", age: "6-9", drawYear: 2023, assignedId: "" },
  ],
};

const pastDraws: Draw[] = [
  {
    year: 2023,
    ages: "",
    drawn: true,
    groups: "6,10,14,18",
    players: [
      { personId: "asa", assignedId: "mba", age: "6-9", drawYear: 2023 },
      { personId: "lba", assignedId: "asa", age: "6-9", drawYear: 2023 },
      { personId: "mba", assignedId: "vsa", age: "6-9", drawYear: 2023 },
      { personId: "vsa", assignedId: "lba", age: "6-9", drawYear: 2023 },
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
