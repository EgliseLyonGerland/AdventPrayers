import type { Person } from "@prisma/client";
import { Fragment } from "react";

type Props = {
  edit: boolean;
  data?: Pick<
    Person,
    "id" | "firstName" | "lastName" | "email" | "gender" | "gender" | "age"
  >;
  onClose?: () => void;
};

export default function PersonModalForm({
  edit = false,
  data,
  onClose,
}: Props) {
  return (
    <>
      <input
        type="checkbox"
        id="addPersonModal"
        className="modal-toggle"
        onChange={onClose}
      />
      <label htmlFor="addPersonModal" className="modal-open modal">
        <label className="modal-box relative w-11/12" htmlFor="">
          <label
            htmlFor="addPersonModal"
            className="btn-sm btn-circle btn absolute right-4 top-4"
          >
            ✕
          </label>

          <h3 className="text-lg font-bold">Ajouter une nouvelle personne</h3>

          <div className="mt-8">
            <input type="hidden" name="id" value={data?.id} />

            <div className="form-control mb-4 w-full max-w-xs">
              <label className="label">
                <span className="label-text">Prénom</span>
              </label>
              <input
                type="text"
                name="firstName"
                className="input-bordered input w-full max-w-xs"
                defaultValue={data?.firstName || ""}
              />
            </div>
            <div className="form-control mb-4 w-full max-w-xs">
              <label className="label">
                <span className="label-text">Nom</span>
              </label>
              <input
                type="text"
                name="lastName"
                className="input-bordered input w-full max-w-xs"
                defaultValue={data?.lastName || ""}
              />
            </div>
            <div className="form-control mb-4 w-full max-w-xs">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className="input-bordered input w-full max-w-xs"
                defaultValue={data?.email || ""}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Genre</span>
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
            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">Age</span>
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
          </div>
        </label>
      </label>
    </>
  );
}
