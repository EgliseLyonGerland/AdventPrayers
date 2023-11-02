import { type Person } from "@prisma/client";

import { AppNameQuoted } from "~/config";

import Email, { Button, Text } from "./base";

interface Props {
  person: Person;
}

function UnregisteredEmail({ person }: Props) {
  const searchParams = new URLSearchParams({
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email || "",
    age: person.age,
    gender: person.gender,
    bio: person.bio || "",
  });

  return (
    <Email
      content={[
        <Text key={1}>
          J‘ai bien pris note de ta désincription à l‘édition 2023 de{" "}
          {AppNameQuoted} !
        </Text>,
        <Text key={1}>
          Je suis un peu triste mais tu dois avoir une très bonne raison. Sache
          en tout cas que tu peux revenir quand tu veux.
        </Text>,
        <Button href={`/register?${searchParams.toString()}`} key={4}>
          Me réinscrire
        </Button>,
        <Text key={5}>A bientôt j‘espère !</Text>,
      ]}
      heading={`Hey ${person.firstName} ! 👋`}
    />
  );
}

export default UnregisteredEmail;
