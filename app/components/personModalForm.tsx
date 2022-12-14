import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Person } from "@prisma/client";
import { useState } from "react";
import { Fragment } from "react";

import type { WithRequired } from "~/utils";
import { notNullable } from "~/utils";

import EntitySelector from "./entitySelector";

type Data = WithRequired<
  Person,
  "id" | "firstName" | "lastName" | "email" | "gender" | "gender" | "age"
>;

type Props = {
  edit: boolean;
  data?: Data & {
    exclude: Pick<Person, "id">[];
  };
  persons: Data[];
  onClose?: () => void;
};

export default function PersonModalForm({
  edit = false,
  data,
  persons,
  onClose,
}: Props) {
  const [excludedPersons, setExcludedPersons] = useState(
    data?.exclude
      .map((item) => persons.find((person) => person.id === item.id))
      .filter(notNullable) || []
  );

  return (
    <>
      <input
        className="modal-toggle"
        id="addPersonModal"
        onChange={onClose}
        type="checkbox"
      />
      <input name="id" type="hidden" value={data?.id} />

      <label className="modal-open modal" htmlFor="addPersonModal">
        <label
          className="modal-box w-11/12 max-w-4xl overflow-visible"
          htmlFor=""
        >
          <label
            className="btn-sm btn-circle btn absolute right-4 top-4"
            htmlFor="addPersonModal"
          >
            <XMarkIcon height={16} />
          </label>

          <h3 className="mb-4 text-lg font-bold">
            Ajouter une nouvelle personne
          </h3>

          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Prénom</span>
                </label>
                <input
                  className="input-bordered input"
                  defaultValue={data?.firstName || ""}
                  name="firstName"
                  type="text"
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Nom</span>
                </label>
                <input
                  className="input-bordered input"
                  defaultValue={data?.lastName || ""}
                  name="lastName"
                  type="text"
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Email</span>
                </label>
                <input
                  className="input-bordered input"
                  defaultValue={data?.email || ""}
                  name="email"
                  type="email"
                />
              </div>
            </div>
            <div>
              <div className="form-control mb-8">
                <label className="label">
                  <span className="label-text font-bold">Genre</span>
                </label>
                <div className="mt-2 flex items-center gap-6">
                  <input
                    className="radio"
                    defaultChecked={data?.gender === "male" || true}
                    id="genderMale"
                    name="gender"
                    type="radio"
                    value="male"
                  />
                  <label className="-ml-2" htmlFor="genderMale">
                    Homme
                  </label>
                  <input
                    className="radio"
                    defaultChecked={data?.gender === "female"}
                    id="genderFemale"
                    name="gender"
                    type="radio"
                    value="female"
                  />
                  <label className="-ml-2" htmlFor="genderFemale">
                    Femme
                  </label>
                </div>
              </div>
              <div className="form-control mb-8">
                <label className="label">
                  <span className="label-text font-bold">Age</span>
                </label>

                <div className="mt-2 flex items-center gap-6">
                  {["18+", "14-17", "10-13", "6-9"].map((value) => (
                    <Fragment key={value}>
                      <input
                        className="radio"
                        defaultChecked={data?.age === value || value === "18+"}
                        id={`age${value}`}
                        name="age"
                        type="radio"
                        value={value}
                      />
                      <label className="-ml-2" htmlFor={`age${value}`}>
                        {value}
                      </label>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Personnes exclus</span>
                </label>

                <div className="divide-y divide-white/10">
                  {excludedPersons.map((person) => (
                    <div className="p-2 flex-center" key={person.id}>
                      <input name="exclude[]" type="hidden" value={person.id} />
                      <span>
                        {person.firstName} {person.lastName}
                      </span>
                      <button
                        className="btn-ghost btn-sm btn ml-auto"
                        onClick={(event) => {
                          setExcludedPersons(
                            excludedPersons.filter(
                              (item) => item.id !== person.id
                            )
                          );

                          event.preventDefault();
                        }}
                      >
                        <XMarkIcon height={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <EntitySelector
                  className="mt-4"
                  filterBy={["firstName", "lastName"]}
                  horizontal="end"
                  items={persons}
                  keyProp="id"
                  name="Ajouter une personne"
                  onSelect={(person) => {
                    setExcludedPersons([...excludedPersons, person]);
                  }}
                  renderItem={(person) =>
                    `${person.firstName} ${person.lastName}`
                  }
                  vertical="top"
                />
              </div>
            </div>
          </div>

          <div className="modal-action mt-8">
            <button
              className="btn"
              name="_action"
              type="submit"
              value={edit ? "editPerson" : "newPerson"}
            >
              {edit ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </label>
      </label>
    </>
  );
}
