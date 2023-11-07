import { type Person } from "~/models/person.server";
import { getCurrentYear, toAbsoluteUrl } from "~/utils";
import t from "~/utils/i18n";

import Email, { Button, Image, Text } from "./base";

interface Props {
  person: Person;
}

export default function AdminRegistationAdded({ person }: Props) {
  return (
    <Email heading="Nouvelle inscription" signature={false}>
      <Text>
        <div style={{ fontWeight: "bold" }}>Prénom</div>
        <div style={{ opacity: 0.7 }}>{person.firstName}</div>
      </Text>
      <Text>
        <div style={{ fontWeight: "bold" }}>Nom</div>
        <div style={{ opacity: 0.7 }}>{person.lastName}</div>
      </Text>
      <Text>
        <div style={{ fontWeight: "bold" }}>Adresse email</div>
        <div style={{ opacity: 0.7 }}>{person.email}</div>
      </Text>
      <Text>
        <div style={{ fontWeight: "bold" }}>Genre</div>
        <div style={{ opacity: 0.7 }}>{t(person.gender)}</div>
      </Text>
      <Text>
        <div style={{ fontWeight: "bold" }}>Age</div>
        <div style={{ opacity: 0.7 }}>{t(person.age)}</div>
      </Text>
      {person.bio ? (
        <Text>
          <div style={{ fontWeight: "bold" }}>Bio</div>
          <div style={{ opacity: 0.7, whiteSpace: "pre-wrap" }}>
            {person.bio}
          </div>
        </Text>
      ) : (
        <div style={{ opacity: 0.7, fontStyle: "italic" }}>Non-renseignée</div>
      )}
      <Text>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Photo</div>
        {person.picture ? (
          <div>
            <Image
              alt={`${person.firstName} ${person.lastName}`}
              src={toAbsoluteUrl(`/uploads/${person.picture}`)}
              style={{ height: 150 }}
            />
          </div>
        ) : (
          <div style={{ opacity: 0.7, fontStyle: "italic" }}>
            Non-renseignée
          </div>
        )}
      </Text>
      <Button href={`/admin/draws/${getCurrentYear()}/registrations`}>
        Gérer
      </Button>
    </Email>
  );
}

AdminRegistationAdded.title = "[Admin] Nouvelle inscription";
