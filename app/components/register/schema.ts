import {
  type Output,
  any,
  email,
  getOutput,
  getPipeIssues,
  minLength,
  object,
  string,
  toTrimmed,
  nullable,
} from "valibot";

const schema = object({
  firstName: string([
    toTrimmed(),
    minLength(1, "Tu dois bien avoir un prénom !"),
  ]),
  lastName: string([
    toTrimmed(),
    minLength(1, "Non je ne peux pas croire que tu n'aies pas de nom !"),
  ]),
  email: string([
    minLength(1, "J’ai vraiment besoin de ton adresse email 🙏"),
    toTrimmed(),
    email("Hmm, ça ressemble pas à une adresse email ça 🤔"),
  ]),
  gender: string("Allez un p’tit effort 😌", [minLength(1)]),
  age: string(
    "Je voudrais bien essayer de deviner mais j’ai peur de ne pas réussir",
    [minLength(1)],
  ),
  bio: nullable(string([toTrimmed()])),
  picture: any([
    (input: File | undefined) => {
      if (input) {
        if (input.size > 5_000_000) {
          return getPipeIssues(
            "custom",
            `Ta photo est supérieur à ${Math.floor(
              input.size / 1000000,
            )} Mo mais ne doit pas dépasser 5 Mo. Il faudrait que tu réduises un peu sa taille.`,
            input,
          );
        }
      }

      return getOutput(input);
    },
  ]),
});

export default schema;

export type Schema = Output<typeof schema>;
