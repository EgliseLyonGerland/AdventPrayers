import { render } from "@react-email/components";
import { get } from "lodash";
import { Renderer, marked } from "marked";

import * as Email from "~/components/emails/base";
import { type Draw } from "~/models/draw.server";
import { type PersonWithExclude } from "~/models/person.server";
import { type Nullable } from "~/types";

type Person = PersonWithExclude;

type VariableGenerator = (
  draw: Draw,
  person: Nullable<Person>,
  assigned: Nullable<Person>,
) => string | number | undefined | null;

interface VariableGenerators {
  [n: string]: VariableGenerator | VariableGenerators;
}

type Content = (
  | {
      type: "text";
      value: string;
    }
  | {
      type: "button";
      value: string;
      href: string;
    }
  | {
      type: "image";
      src: string;
    }
)[];

Renderer.prototype.paragraph = (text) => text;

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

export function tokenize(text: string): Content {
  const tokens = marked.lexer(text);

  return tokens.reduce<Content>((acc, curr) => {
    if (curr.type === "space") {
      return acc;
    }

    const link =
      "tokens" in curr && curr.tokens?.find((token) => token.type === "link");

    if (link && link.type === "link") {
      return acc.concat({
        type: "button",
        href: link.href,
        value: link.text.trim(),
      });
    }

    const image =
      "tokens" in curr && curr.tokens?.find((token) => token.type === "image");

    if (image && image.type === "image") {
      return acc.concat({
        type: "image",
        src: image.href,
      });
    }

    if (!("text" in curr)) {
      return acc;
    }

    return acc.concat({
      type: "text",
      value: marked.parse(curr.text.trim()),
    });
  }, []);
}

export function renderEmail(title: string, content: string) {
  return render(
    <Email.Base heading={title || undefined}>
      {tokenize(content).map((item, index) =>
        item.type === "text" ? (
          <Email.Text
            dangerouslySetInnerHTML={{ __html: item.value }}
            key={index}
          />
        ) : item.type === "button" ? (
          <Email.Button href={item.href} key={index}>
            {item.value}
          </Email.Button>
        ) : item.type === "image" ? (
          <Email.Image src={item.src} />
        ) : null,
      )}
    </Email.Base>,
  );
}
