import { get } from "lodash";
import { marked } from "marked";

import { type PersonWithExclude } from "~/models/person.server";
import { type Nullable } from "~/types";

import { type Draw } from "./draw.server";

type Person = PersonWithExclude;

type VariableGenerator = (
  draw: Draw,
  person: Nullable<Person>,
  assigned: Nullable<Person>,
) => string | number | undefined | null;

interface VariableGenerators {
  [n: string]: VariableGenerator | VariableGenerators;
}

const variableGenerators: VariableGenerators = {
  year: (draw) => draw.year,
  nextYear: (draw) => (draw.year ? draw.year + 1 : null),
  src: {
    firstName: (_, person) => person?.firstName,
    lastName: (_, person) => person?.lastName,
    pronoun: (_, person) =>
      person ? (person?.gender === "male" ? "lui" : "elle") : null,
  },
  dst: {
    firstName: (_, __, assigned) => assigned?.firstName,
    lastName: (_, __, assigned) => assigned?.lastName,
    pronoun: (_, __, assigned) =>
      assigned ? (assigned.gender === "male" ? "lui" : "elle") : null,
  },
};

function getVariables(generators: VariableGenerators, prefix = ""): string[] {
  return Object.entries(generators).reduce<string[]>(
    (acc, [key, generator]) => {
      if (typeof generator === "function") {
        return acc.concat(`${prefix}${key}`);
      }

      return acc.concat(getVariables(generator, `${prefix}${key}.`));
    },
    [],
  );
}

export const variables = getVariables(variableGenerators);

export function generate(
  text: string,
  draw: Draw,
  person?: Person,
  assigned?: Nullable<Person>,
): string {
  return text.replace(/%([\w.]+)%/g, (match, variableName) => {
    const generator = get(variableGenerators, variableName) as
      | VariableGenerator
      | undefined;

    if (typeof generator !== "function") {
      return match;
    }

    const result = generator(draw, person, assigned);

    if (!result) {
      return match;
    }

    return `${result}`;
  });
}

export function toMarkdown(text: string) {
  return marked.parse(text, {
    breaks: true,
  });
}
