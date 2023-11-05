import { type Draw } from "~/models/draw.server";
import { type PersonWithExclude } from "~/models/person.server";

import { generate } from "../email";

const persons = [
  {
    id: "123",
    firstName: "Jon",
    lastName: "Snow",
    email: "",
    gender: "male",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
  {
    id: "456",
    firstName: "Arya",
    lastName: "Stark",
    email: "",
    gender: "female",
    age: "",
    bio: "",
    picture: "",
    exclude: [],
  },
] satisfies PersonWithExclude[];

test("generate()", () => {
  const text = `Tu t'appelles %src.firstName% %src.lastName% et %dst.pronoun% s'appelle %dst.firstName% %dst.lastName%`;

  const draw: Draw = {
    year: 2022,
    groups: "",
    ages: "",
    drawn: false,
    players: persons.map((person) => ({
      age: person.age,
      personId: person.id,
      assignedId: "",
      drawYear: 2023,
    })),
  };

  expect(generate(text, draw, persons[0])).toEqual(
    "Tu t'appelles Jon Snow et %dst.pronoun% s'appelle %dst.firstName% %dst.lastName%",
  );
  expect(generate(text, draw, persons[0], persons[1])).toEqual(
    "Tu t'appelles Jon Snow et elle s'appelle Arya Stark",
  );
});
