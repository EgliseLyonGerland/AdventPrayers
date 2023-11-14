import { type Draw } from "~/models/draw.server";
import { type PersonWithExclude } from "~/models/person.server";

import { generate, tokenize } from "../email";

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
  const text = `Tu t'appelles %src.firstName% %src.lastName% et %dst.g(il,elle)% s'appelle %dst.firstName% %dst.lastName%`;

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
    "Tu t'appelles Jon Snow et %dst.g(il,elle)% s'appelle %dst.firstName% %dst.lastName%",
  );
  expect(generate(text, draw, persons[0], persons[1])).toEqual(
    "Tu t'appelles Jon Snow et elle s'appelle Arya Stark",
  );
});

test("parse()", () => {
  const text = `

Sint deserunt **laboris** aliqua pariatur aliqua nulla.

Do nisi laborum do qui incididunt.
Anim do tempor enim nulla voluptate enim minim aliqua Lorem velit dolore labore fugiat.

 [My button](/foo)

      Sunt culpa laboris irure est.
  ![My Image](/foo)

Exercitation fugiat pariatur ullamco dolore cupidatat.
  `;

  expect(tokenize(text)).toEqual([
    {
      type: "text",
      value:
        "Sint deserunt <strong>laboris</strong> aliqua pariatur aliqua nulla.",
    },
    {
      type: "text",
      value:
        "Do nisi laborum do qui incididunt.\nAnim do tempor enim nulla voluptate enim minim aliqua Lorem velit dolore labore fugiat.",
    },
    {
      type: "button",
      value: "My button",
      href: "/foo",
    },
    {
      type: "text",
      value: "Sunt culpa laboris irure est.",
    },
    {
      type: "image",
      src: "/foo",
    },
    {
      type: "text",
      value: "Exercitation fugiat pariatur ullamco dolore cupidatat.",
    },
  ]);
});
