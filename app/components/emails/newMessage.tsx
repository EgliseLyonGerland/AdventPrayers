import { type Person } from "~/models/person.server";

import Email, { Button, Section, Text } from "./base";

interface Props {
  person: Person;
  message: string;
}

export default function NewMessageEmail({ person, message }: Props) {
  const searchParams = new URLSearchParams({ message });

  return (
    <Email heading={`Hey ${person.firstName} ! 👋`}>
      <Text>
        Tu as reçu un nouveau message de la part de ton prieur mystère.
      </Text>
      <Text>Voici ce qu’il t’écrit :</Text>

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
        Pour répondre à ce message, tu ne peux pas le faire en répondant à cet
        email. Il te suffit simplement de cliquer sur le bouton ci-dessous.
      </Text>
      <Button href={`/me/${person.id}/answer?${searchParams}`}>Répondre</Button>
    </Email>
  );
}

NewMessageEmail.title = "Tu as reçu un message 📬";
