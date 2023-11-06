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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontWeight: "bold" }}>Prénom</div>
            <div style={{ opacity: 0.7 }}>{person.firstName}</div>
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Nom</div>
            <div style={{ opacity: 0.7 }}>{person.lastName}</div>
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Adresse email</div>
            <div style={{ opacity: 0.7 }}>{person.email}</div>
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Genre</div>
            <div style={{ opacity: 0.7 }}>{t(person.gender)}</div>
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Age</div>
            <div style={{ opacity: 0.7 }}>{t(person.age)}</div>
          </div>
          {person.bio ? (
            <div>
              <div style={{ fontWeight: "bold" }}>Bio</div>
              <div style={{ opacity: 0.7, whiteSpace: "pre-wrap" }}>
                {person.bio}
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.7, fontStyle: "italic" }}>
              Non-renseignée
            </div>
          )}
          {person.picture ? (
            <div>
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>Photo</div>
              <div>
                <Image
                  alt={`${person.firstName} ${person.lastName}`}
                  src={toAbsoluteUrl(`/uploads/${person.picture}`)}
                  style={{ height: 150 }}
                />
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.7, fontStyle: "italic" }}>
              Non-renseignée
            </div>
          )}
        </div>
      </Text>
      <Button href={`/admin/draws/${getCurrentYear()}/registration`}>
        Gérer
      </Button>
    </Email>
  );
}

AdminRegistationAdded.title = "[Admin] Nouvelle inscription";
