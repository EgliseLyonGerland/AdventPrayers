import type * as Client from "@prisma/client";
import { shuffle } from "lodash";

import { WithRequired } from "~/types";

import { inGroup, parseGroups } from "./groups";
import HamiltonianCycle from "./HamiltonianCycle";

export type Player = WithRequired<Client.Player, "personId" | "age">;

export type Draw = WithRequired<Client.Draw, "groups"> & {
  players: Player[];
};

export type Person = WithRequired<Client.Person, "id" | "lastName"> & {
  exclude: Pick<Client.Person, "id">[];
};

function findPerson(id: string, persons: Person[]) {
  return persons.find((person) => person.id === id) as Person;
}

function itExcludes(person: Person, other: Person) {
  return !!person.exclude.find((person) => person.id === other.id);
}

function hasAlreadyPrayedForCandidate(
  person: Person,
  candidate: Person,
  pastDraws: Draw[],
) {
  for (const draw of pastDraws) {
    const row = draw.players.find((player) => player.personId === person.id);

    if (row?.assignedId === candidate.id) {
      return true;
    }
  }

  return false;
}

function isCandidate(person1: Person, person2: Person, pastDraws: Draw[]) {
  // The player and the candidate must be different
  if (person1.id === person2.id) {
    return false;
  }

  // The player and the candidate must not be in the same family
  if (person1.lastName === person2.lastName) {
    return false;
  }
  // The player and the candidate must not exclude each other
  if (itExcludes(person1, person2)) {
    return false;
  }
  // The player must not have prayed for the candidates in past draws
  if (hasAlreadyPrayedForCandidate(person1, person2, pastDraws)) {
    return false;
  }

  return true;
}

export function letsDraw(
  draw: Draw,
  pastDraws: Draw[],
  persons: Person[],
): Record<string, string> {
  const groups = parseGroups(draw.groups);

  return groups.reduce<Record<string, string>>((acc, group) => {
    const players = shuffle(
      draw.players.filter((player) => inGroup(player.age, group)),
    );

    if (players.length === 0) {
      return acc;
    }

    const graph = players.map((player1) => {
      const person1 = findPerson(player1.personId, persons);

      return players.map((player2) => {
        const person2 = findPerson(player2.personId, persons);

        return isCandidate(person1, person2, pastDraws) ? 1 : 0;
      });
    });

    const ham = new HamiltonianCycle(graph);
    const chain = ham.run().map((index) => players[index].personId);

    return {
      ...acc,
      ...chain.reduce(
        (acc, curr, index) => ({
          ...acc,
          [curr]: chain[index + 1] || chain[0],
        }),
        {},
      ),
    };
  }, {});
}
