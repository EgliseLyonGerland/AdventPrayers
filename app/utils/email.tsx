import { get } from "lodash";
import { Renderer, marked } from "marked";

import { templatesComponent } from "~/components/emails";
import * as Email from "~/components/emails/base";
import { AppName, AppNameQuoted } from "~/config";
import { type Draw } from "~/models/draw.server";
import { type Person, type PersonWithExclude } from "~/models/person.server";
import { type Registration } from "~/models/registrations.server";
import { type Nullable } from "~/types";

import { genderize } from ".";

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

type VariableGenerator = (
  data: {
    draw: Draw;
    person: Nullable<PersonWithExclude>;
    assigned: Nullable<PersonWithExclude>;
  },
  ...params: string[]
) => string | number | undefined | null;

Renderer.prototype.paragraph = (text) => text;

export const variables = [
  "appName",
  "appNameQuote",
  "year",
  "nextYear",
  "src.id",
  "src.firstName",
  "src.lastName",
  "src.bio",
  "src.picture",
  "src.g",
  "src.registerLink",
  "dst.id",
  "dst.firstName",
  "dst.lastName",
  "dst.bio",
  "dst.picture",
  "dst.g",
] as const;

export type Variable = (typeof variables)[number];

export const variableGenerators: Record<Variable, VariableGenerator> = {
  appName: () => AppName,
  appNameQuote: () => AppNameQuoted,
  year: ({ draw }) => draw.year,
  nextYear: ({ draw }) => draw.year + 1,

  "src.id": ({ person }) => person?.id,
  "src.firstName": ({ person }) => person?.firstName,
  "src.lastName": ({ person }) => person?.lastName,
  "src.bio": ({ person }) => person?.bio,
  "src.picture": ({ person }) => person?.picture,
  "src.g": ({ person }, mas, fem) => person && genderize(mas, person, fem),
  "src.registerLink": ({ person }) => {
    if (!person) {
      return "/";
    }

    const searchParams = new URLSearchParams();
    searchParams.set("firstName", person.firstName);
    searchParams.set("lastName", person.lastName);
    searchParams.set("gender", person.gender);
    searchParams.set("age", person.age);

    if (person.email) {
      searchParams.set("email", person.email);
    }
    if (person.bio) {
      searchParams.set("bio", person.bio);
    }

    return `/register?${searchParams.toString()}`;
  },

  "dst.id": ({ assigned }) => assigned?.id,
  "dst.firstName": ({ assigned }) => assigned?.firstName,
  "dst.lastName": ({ assigned }) => assigned?.lastName,
  "dst.bio": ({ assigned }) => assigned?.bio,
  "dst.picture": ({ assigned }) => assigned?.picture,
  "dst.g": ({ assigned }, mas, fem) =>
    assigned && genderize(mas, assigned, fem),
};

export function generate(
  text: string,
  draw: Draw,
  person?: PersonWithExclude,
  assigned?: Nullable<PersonWithExclude>,
): string {
  return text.replace(/%(.+?)%/g, (match, expr) => {
    if (typeof expr !== "string") {
      return match;
    }

    const [variableName, args] = expr.trim().split(/[\\(\\)]/);

    const generator = get(variableGenerators, variableName) as
      | VariableGenerator
      | undefined;

    if (typeof generator !== "function") {
      return match;
    }

    const result = generator(
      { draw, person, assigned },
      ...(args
        ? args
            .split(",")
            .map((arg) => arg.trim())
            .filter(Boolean)
        : []),
    );

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

export function generateEmailFromString(title: string, content: string) {
  return (
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
    </Email.Base>
  );
}

export function generateEmailFromTemplate(
  name: keyof typeof templatesComponent,
  {
    draw,
    person,
    assignedPerson,
    registration,
    message,
  }: {
    draw?: Draw;
    person?: Person;
    assignedPerson?: Person;
    registration?: Registration;
    message?: string;
  } = {},
) {
  switch (name) {
    case "adminRegistrationAdded": {
      if (person) {
        const Component = templatesComponent[name];
        return <Component person={person} />;
      }
      break;
    }

    case "adminRegistrationDeleted": {
      if (person) {
        const Component = templatesComponent[name];
        return <Component person={person} />;
      }
      break;
    }

    case "newAnswer": {
      if (person && assignedPerson && message) {
        const Component = templatesComponent[name];
        return (
          <Component
            assignedPerson={assignedPerson}
            message={message}
            person={person}
          />
        );
      }
      break;
    }

    case "newMessage": {
      if (person && message) {
        const Component = templatesComponent[name];
        return <Component message={message} person={person} />;
      }
      break;
    }

    case "registrationApproved": {
      if (person) {
        const Component = templatesComponent[name];
        return <Component person={person} />;
      }
      break;
    }

    case "registrationRecorded": {
      if (registration) {
        const Component = templatesComponent[name];
        return <Component registration={registration} />;
      }
      break;
    }

    case "unregistered": {
      if (person) {
        const Component = templatesComponent[name];
        return <Component person={person} />;
      }
      break;
    }

    case "start": {
      if (draw && person && assignedPerson) {
        const Component = templatesComponent[name];
        return (
          <Component
            assignedPerson={assignedPerson}
            draw={draw}
            person={person}
          />
        );
      }
      break;
    }
  }

  return <>Impossible de générer l’email à partir du template</>;
}

export function isTemplate(
  name: string,
): name is keyof typeof templatesComponent {
  return name in templatesComponent;
}
