import { AppNameQuoted } from "~/config";
import { type Person } from "~/models/person.server";

import Email, { Text } from "./base";

interface Props {
  person: Person;
}

export default function RegistrationRecordedEmail({ person }: Props) {
  return (
    <Email heading={`Hey ${person.firstName} ! 👋`}>
      <Text>
        Ton inscription est bien enregistrée . Je suis heureux de te compter
        parmi les participants à l’édition 2023 de {AppNameQuoted} !
      </Text>
      <Text>
        Je dois cependant encore effectuer une validation manuelle pour
        entériner ta participation à l’opération. À la suite de quoi, tu
        recevras un autre email de confirmation dans lequel tu trouveras un lien
        te permettant d’accéder à ton espace “participant”. Dans cet espace, tu
        auras la possibilité notamment de te désincrire si tu le souhaites.
      </Text>
      <Text>En attendant, je te souhaite un très bonne journée à toi !</Text>
    </Email>
  );
}

RegistrationRecordedEmail.title = "Inscription reçu 5/5 👌🏼";
