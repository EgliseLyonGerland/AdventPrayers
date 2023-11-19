import { type Person } from "~/models/person.server";
import { genderize } from "~/utils";

import Email, { Button, Section, Text } from "./base";

interface Props {
  person: Person;
  assignedPerson: Person;
  message: string;
}

export default function NewAnswerEmail({
  person,
  assignedPerson,
  message,
}: Props) {
  return (
    <Email heading={`Hey ${person.firstName} ! 👋`}>
      <Text>
        Tu as reçu une réponse à ton message de la part de{" "}
        {assignedPerson.firstName}.
      </Text>
      <Text>
        Voici ce qu’{genderize("il", assignedPerson, "elle")} te répond :
      </Text>

      <Section
        style={{
          padding: "0 16px",
          border: "solid 1px",
        }}
      >
        {message.split(/\n/).map((text, index) => (
          <Text
            key={index}
            style={{
              fontStyle: "italic",
              opacity: 0.8,
            }}
          >
            {text}
          </Text>
        ))}
      </Section>

      <Text>
        Si tu souhaites lui répondre en retour, tu peux simplement lui écrire un
        nouveau message de la même façon que tu l’as fait la première fois. Je
        te remet le lien au cas où :
      </Text>
      <Button href={`/me/${person.id}/write`}>Écrire un message</Button>
    </Email>
  );
}

NewAnswerEmail.title = "Tu as reçu une réponse 📬";
