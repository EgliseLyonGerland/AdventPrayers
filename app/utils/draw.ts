import type * as Client from "@prisma/client";

import type { WithRequired } from "~/utils";

type Player = WithRequired<Partial<Client.Player>, "personId">;
type Draw = Pick<Client.Player, "personId" | "assignedId" | "age">[];
type Person = Client.Person & {
  exclude: Pick<Person, "id">[];
};

type ComputedPlayer = Player & {
  exclude: string[];
};

function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function resolveExclude(
  players: Player[],
  prevDraws: Draw[],
  persons: Person[]
): ComputedPlayer[] {
  return players.map((player) => {
    const currentPerson = persons.find(
      (person) => person.id === player.personId
    );

    let exclude: string[] = [];

    // It excludes persons of the same family
    exclude.push(
      ...persons
        .filter(
          (person) =>
            person.id !== currentPerson!.id &&
            person.lastName === currentPerson!.lastName
        )
        .map((person) => person.id)
    );

    // It excludes persons with a different age
    if (currentPerson?.exclude?.length) {
      exclude.push(...currentPerson.exclude.map((person) => person.id));
    }

    // It excludes persons already prayed during the two past events
    prevDraws.forEach((draw) => {
      const row = draw.find((item) => item.personId === player.personId);

      if (row && row.assignedId) {
        exclude.push(row.assignedId);
      }
    });

    return { ...player, exclude: [...new Set(exclude)] };
  });
}

export function getCandidates(
  currentPlayer: ComputedPlayer,
  players: Player[],
  currentDraw: Record<string, string>
): string[] {
  return players
    .filter(
      (player) =>
        // The current player cannot pray for himself
        currentPlayer.personId !== player.personId &&
        // The current player cannot pray for someone with a different age
        currentPlayer.age === player.age &&
        // The current player cannot pray for a player praying for him
        currentDraw[player.personId] !== currentPlayer.personId &&
        // The current player cannot pray for someone already selected
        !Object.values(currentDraw).includes(player.personId) &&
        // The current player cannot pray for someone he excluded
        !currentPlayer.exclude.includes(player.personId)
    )
    .map((player) => player.personId);
}

export function letsDraw(
  players: Player[],
  pastDraws: Draw[],
  persons: Person[]
) {
  const result: Record<string, string> = {};

  resolveExclude(players, pastDraws, persons)
    .sort((a, b) => b.exclude.length - a.exclude.length)
    .forEach((computedPlayer) => {
      const candidates = getCandidates(computedPlayer, players, result);
      const candidate = sample(candidates);

      result[computedPlayer.personId] = candidate || "";
    });

  return result;
}
