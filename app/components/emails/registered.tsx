import { AppNameQuoted } from "~/config";
import { type Person } from "~/models/person.server";
import { formatDate, getCurrentYear, getFirstAdventSundayDate } from "~/utils";

import Email, { Button, Text } from "./base";

interface Props {
  person: Person;
}

function RegisteredEmail({ person }: Props) {
  const startsAt = getFirstAdventSundayDate(getCurrentYear());

  return (
    <Email
      content={[
        <Text key={1}>
          Ton inscription est bien enregistrée. Je suis heureux de te compter
          parmi les participants à l’édition 2023 de {AppNameQuoted} !
        </Text>,
        <Text key={2}>
          Il ne te reste maintenant plus qu’à patienter jusqu’au{" "}
          {formatDate(startsAt)} prochain pour connaître le nom de la personne
          qui sera désignée pour la porter dans tes prières.
        </Text>,
        <Text key={3}>
          Sache que tu peux te désinscrire à tout moment avant que l’opération
          ne démarre. Il te suffit pour cela d’accéder à ton espace participant
          en cliquant sur le bouton ci-dessous. J’espère quand même que tu n’en
          auras pas besoin 😇.
        </Text>,
        <Button href={`/me/${person.id}`} key={4}>
          Accéder à mon espace
        </Button>,
        <Text key={5}>À très bientôt dans un prochain message !</Text>,
      ]}
      heading={`Hey ${person.firstName} ! 👋`}
    />
  );
}

export default RegisteredEmail;
