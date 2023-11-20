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
        Tu trouveras ci-dessous un lien qui te donnera accès à ton espace
        participant. Dans cet espace tu pourras modifier tes informations et tu
        pourras également te désinscrire de l’opération tant qu’elle n’a pas
        démarré. Une fois lancée, tu y trouveras les informations de la personne
        qui fera l’objet de tes prières et tu auras la possibilité de lui
        envoyer un message de façon anonyme. Mais je t’expliquerai ça le{" "}
        {formatDate(startsAt)} !
      </Text>
      <Button href={`/me/${person.id}`}>Accéder à mon espace</Button>
      <Text>À très bientôt !</Text>
    </Email>
  );
}

RegistrationApprovedEmail.title = "Ton inscription est validée ✅";
