import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Person } from "@prisma/client";
import { useState } from "react";
import { Fragment } from "react";

import type { WithRequired } from "~/utils";
import { notNullable } from "~/utils";

import EntitySelector from "./entitySelector";

type Data = WithRequired<
  Partial<Person>,
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
        type="checkbox"
        id="addPersonModal"
        className="modal-toggle"
        onChange={onClose}
      />
      <input type="hidden" name="id" value={data?.id} />

      <label htmlFor="addPersonModal" className="modal-open modal">
        <label
          className="modal-box w-11/12 max-w-4xl overflow-visible"
          htmlFor=""
        >
          <label
            htmlFor="addPersonModal"
            className="btn-sm btn-circle btn absolute right-4 top-4"
          >
            ✕
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
                  type="text"
                  name="firstName"
                  className="input-bordered input"
                  defaultValue={data?.firstName || ""}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Nom</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="input-bordered input"
                  defaultValue={data?.lastName || ""}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-bold">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input-bordered input"
                  defaultValue={data?.email || ""}
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
                    id="genderMale"
                    type="radio"
                    name="gender"
                    value="male"
                    className="radio"
                    defaultChecked={data?.gender === "male" || true}
                  />
                  <label className="-ml-2" htmlFor="genderMale">
                    Homme
                  </label>
                  <input
                    id="genderFemale"
                    type="radio"
                    name="gender"
                    value="female"
                    className="radio"
                    defaultChecked={data?.gender === "female"}
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
                        id={`age${value}`}
                        type="radio"
                        name="age"
                        value={value}
                        className="radio"
                        defaultChecked={data?.age === value || value === "18+"}
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
                    <div key={person.id} className="p-2 flex-center">
                      <input type="hidden" name="exclude[]" value={person.id} />
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
                  name="Ajouter une personne"
                  items={persons}
                  keyProp="id"
                  filterBy={["firstName", "lastName"]}
                  vertical="top"
                  horizontal="end"
                  renderItem={(person) =>
                    `${person.firstName} ${person.lastName}`
                  }
                  onSelect={(person) => {
                    setExcludedPersons([...excludedPersons, person]);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="modal-action mt-8">
            <button
              type="submit"
              name="_action"
              value={edit ? "editPerson" : "newPerson"}
              className="btn"
            >
              {edit ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </label>
      </label>
    </>
  );
}
