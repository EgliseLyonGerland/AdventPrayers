import { useState } from "react";
import { Combobox } from "@headlessui/react";
import type { Person } from "@prisma/client";

type Data = Pick<Person, "id" | "firstName" | "lastName" | "age">;

type Props = {
  persons: Data[];
  onSelect: (person: Data) => void;
};

function PersonSelector({ persons, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filteredPersons =
    query === ""
      ? persons
      : persons.filter((person) => {
          const name =
            `${person.firstName} ${person.lastName}`.toLocaleLowerCase();
          return name.includes(query.toLowerCase());
        });

  return (
    <Combobox nullable onChange={onSelect}>
      <Combobox.Input
        className="input-bordered input-primary input w-full max-w-xs"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ajouter une personne"
        autoComplete="off"
      />
      <Combobox.Options>
        {filteredPersons.map((person) => (
          <Combobox.Option key={person.id} value={person}>
            {person.firstName} {person.lastName}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  );
}

export default PersonSelector;
