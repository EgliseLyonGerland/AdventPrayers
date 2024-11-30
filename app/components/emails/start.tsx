import { AppNameQuoted } from "~/config";
import { type Draw } from "~/models/draw.server";
import { type Person } from "~/models/person.server";
import { genderize } from "~/utils";

import Email, { Button, Heading, Text } from "./base";

interface Props {
  draw: Draw;
  person: Person;
  assignedPerson: Person;
}

export default function StartEmail({ draw, person, assignedPerson }: Props) {
  return (
    <Email heading={`Hey ${person.firstName} ! 👋`}>
      <Text>
        Voici venu le temps de l’Avent et le début de l’opération{" "}
        {AppNameQuoted}. 💃💃💃
      </Text>
      <Text>
        J’ai plein de choses à te dire alors prends bien soin de lire le message
        en entier 🙏. Mais tout d’abord, sans plus attendre, je vais te dévoiler
        le nom de la personne qui a été tirée au sort parmi les autres
        participants. Il s’agit de…
      </Text>
      <Text style={{ textAlign: "center", padding: "10px 0" }}>🥁🥁🥁</Text>
      <Text style={{ textAlign: "center", padding: "10px 0" }}>
        …Roulements de tambour…
      </Text>
      <Text style={{ textAlign: "center", padding: "10px 0" }}>🥁🥁🥁</Text>
      <Text
        style={{
          borderRadius: ".375rem",
          paddingLeft: ".5rem",
          paddingRight: ".5rem",
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
          paddingTop: "2rem",
          paddingBottom: "2rem",
          fontSize: "1.2rem",
          lineHeight: "2rem",
          ...(assignedPerson.gender === "male"
            ? { backgroundColor: "hsl(175 70% 41%)" }
            : { backgroundColor: "hsl(316 70% 50%)" }),
        }}
      >
        {assignedPerson.firstName} {assignedPerson.lastName}
      </Text>

      <Heading as="h3">Ta mission</Heading>

      <Text>
        Maintenant que tu sais pour qui tu dois prier, n’oublie pas de le faire
        quotidiennement. Si tu ne connais pas bien {assignedPerson.firstName},
        c’est justement l’occasion d’y remédier au gré de discussions le
        dimanche !
      </Text>
      <Text>
        Mais attention, ne te dévoile à{" "}
        {genderize("lui", assignedPerson, "elle")} qu’à partir du 25 décembre à
        minuit, et pas avant ! Une fois ce délai passé, tu pourras alors te
        faire connaître en offrant si possible un petit cadeau selon tes moyens.
        L’idée étant de marquer l’occasion par une attention personnalisée et la
        valeur se veut surtout symbolique.
      </Text>

      <Heading as="h3">Ton espace</Heading>
      <Text>
        Tu trouveras ci-dessous un bouton permettant d’accéder à ton espace
        participant. Dans ce dernier tu retrouveras tes informations avec la
        possibilité de les modifier. Tu pourras voir également la photo et la
        description de {assignedPerson.firstName}, si toutefois{" "}
        {genderize("il", assignedPerson, "elle")} a renseigné ces informations.
      </Text>
      <Text>
        Sache également que tu as la possibilité d’envoyer des messages de façon
        anonyme à {assignedPerson.firstName} directement depuis la plateforme.
        Il te suffit pour cela d’accéder à ton espace participant et cliquer sur
        “ENVOYER UN MESSAGE À {assignedPerson.firstName.toUpperCase()}”. Tu
        pourras également via la plateforme, répondre aux messages qui te seront
        envoyés par ton prieur mystère.
      </Text>
      <Text style={{ fontStyle: "italic" }}>
        ⚠️ N’oublie pas que l’opération {AppNameQuoted} est une mission top
        secrète 🤐. Fais donc très attention à ne pas donner d’indice sur ton
        identité dans les messages que tu enverras à {assignedPerson.firstName}.
      </Text>
      <Button href={`/me/${person.id}`}>
        Accéder à mon espace participant
      </Button>

      <Text>
        Voilà, si tu as la moindre question, tu peux m’écrire simplement en
        répondant à cet email ou en écrivant à
        enaventlapriere@egliselyongerland.org.
      </Text>
      <Text>
        Il ne me reste qu’à te souhaiter un très bon premier dimanche de l’Avent
        et une bonne édition {draw.year} de {AppNameQuoted} !
      </Text>
    </Email>
  );
}

StartEmail.title = "À vos marques, prêt, priez ! 🏁";
