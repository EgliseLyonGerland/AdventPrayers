import { AppNameQuoted } from "~/config";
import { type Person } from "~/models/person.server";
import { formatDate, getCurrentYear, getFirstAdventSundayDate } from "~/utils";

import Email, { Button, Text } from "./base";

interface Props {
  person: Person;
}

export default function RegistrationApprovedEmail({ person }: Props) {
  const startsAt = getFirstAdventSundayDate(getCurrentYear());

  return (
    <Email heading={`Hey ${person.firstName} ! 👋`}>
      <Text>
        J’ai validé ta participation à l’édition 2023 de {AppNameQuoted}
        {" 🎉"}
      </Text>
      <Text>
        Il ne te reste maintenant plus qu’à patienter jusqu’au{" "}
        {formatDate(startsAt)} prochain où tu recevras un message qui te
        permettra de connaître le nom de la personne qui sera désignée afin de
        la porter dans tes prières jusqu’à Noël.
      </Text>
      <Text>
        Sache que tu peux te désinscrire à tout moment avant que l’opération ne
        démarre. Il te suffit pour cela d’accéder à ton espace participant en
        cliquant sur le bouton ci-dessous. J’espère quand même que tu n’en auras
        pas besoin 😇.
      </Text>
      <Button href={`/me/${person.id}`}>Accéder à mon espace</Button>
      <Text>À très bientôt !</Text>
    </Email>
  );
}

RegistrationApprovedEmail.title = "Ton inscription est validée ✅";
