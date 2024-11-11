import { AppNameQuoted } from "~/config";
import { type Person } from "~/models/person.server";
import { getCurrentYear } from "~/utils";

import Email, { Button, Text } from "./base";

interface Props {
  person: Person;
}

export default function UnregisteredEmail({ person }: Props) {
  const searchParams = new URLSearchParams({
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email || "",
    age: person.age,
    gender: person.gender,
    bio: person.bio || "",
  });

  return (
    <Email heading={`Hey ${person.firstName} ! 👋`}>
      <Text>
        J’ai bien pris note de ta désincription à l’édition {getCurrentYear()}{" "}
        de {AppNameQuoted} !
      </Text>
      <Text>
        Je suis un peu triste mais tu dois avoir une très bonne raison. Sache en
        tout cas que tu peux revenir quand tu veux.
      </Text>
      <Button href={`/register?${searchParams.toString()}`}>
        Me réinscrire
      </Button>
      <Text>A bientôt j’espère !</Text>
    </Email>
  );
}

UnregisteredEmail.title = "Tu nous quittes déjà 🥺";
