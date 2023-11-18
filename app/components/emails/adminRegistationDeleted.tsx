import { type Person } from "~/models/person.server";
import { genderize } from "~/utils";

import Email, { Text } from "./base";

interface Props {
  person: Person;
}

export default function AdminRegistationDeleted({ person }: Props) {
  return (
    <Email signature={false}>
      <Text>
        {person.firstName} {person.lastName} s’est{" "}
        {genderize("désincrit", person)}.
      </Text>
    </Email>
  );
}

AdminRegistationDeleted.title = "[Admin] Désinscription";
