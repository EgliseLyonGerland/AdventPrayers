import { generate } from "../email";

const persons = [
  {
    id: "123",
    age: "",
    firstName: "Jon",
    lastName: "Snow",
    gender: "male",
    exclude: [],
  },
  {
    id: "456",
    age: "",
    firstName: "Arya",
    lastName: "Stark",
    gender: "female",
    exclude: [],
  },
];

test("generate()", () => {
  const text = `Tu t'appelles %src.firstName% %src.lastName% et %dst.pronoun% s'appelle %dst.firstName% %dst.lastName%`;

  const draw = {
    year: 2022,
    groups: "",
    players: persons.map((person) => ({
      age: person.age,
      personId: person.id,
    })),
  };

  expect(generate(text, draw, persons[0])).toEqual(
    "Tu t'appelles Jon Snow et %dst.pronoun% s'appelle %dst.firstName% %dst.lastName%"
  );
  expect(generate(text, draw, persons[0], persons[1])).toEqual(
    "Tu t'appelles Jon Snow et elle s'appelle Arya Stark"
  );
});
