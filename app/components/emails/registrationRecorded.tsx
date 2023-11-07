import { AppNameQuoted } from "~/config";
import { type Registration } from "~/models/registrations.server";

import Email, { Button, Text } from "./base";

interface Props {
  registration: Registration;
}

export default function RegistrationRecordedEmail({ registration }: Props) {
  return (
    <Email heading={`Hey ${registration.firstName} ! 👋`}>
      <Text>
        Ton inscription est bien enregistrée. Je suis heureux de te compter
        parmi les participants à l’édition 2023 de {AppNameQuoted} !
      </Text>
      <Text>
        Je dois cependant encore effectuer une validation manuelle pour
        entériner ta participation à l’opération. À la suite de quoi, tu
        recevras un autre email de confirmation dans lequel tu trouveras un lien
        te permettant d’accéder à ton espace “participant”. Dans cet espace, tu
        auras la possibilité de voir le profile de la personne désignée une fois
        le tirage lancé. Mais ne t’inquiète pas, je t’en reparlerai un prochaine
        fois...
      </Text>
      <Text>
        En attendant, tu peux à tout moment annuler ton inscription en cliquant
        sur le bouton ci-dessous.
      </Text>
      <Button href={`/unregister/${registration.id}`}>Me désinscrire</Button>
      <Text>Je te souhaite un très bonne journée !</Text>
    </Email>
  );
}

RegistrationRecordedEmail.title = "Inscription enregistrée 👌🏼";
