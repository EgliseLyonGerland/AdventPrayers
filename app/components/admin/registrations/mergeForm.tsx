import clsx from "clsx";
import { useForm } from "react-hook-form";

import { type Person } from "~/models/person.server";
import t from "~/utils/i18n";

interface Props {
  persons: Person[];
  onSubmit: (data: Person) => void;
  onClose: () => void;
}

const attributes = [
  "firstName",
  "lastName",
  "email",
  "gender",
  "age",
  "bio",
  "picture",
] as const;

function MergeForm({ persons, onSubmit, onClose }: Props) {
  const fields = attributes.map((name) => ({
    name,
    values: [...new Set(persons.map((person) => person[name]).filter(Boolean))],
  }));

  const { register, handleSubmit } = useForm<Person>({
    defaultValues: fields.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: curr.values[0] || "",
      }),
      {},
    ),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col divide-y divide-base-content/10 p-8">
        {fields.map((field) => (
          <div className="py-6" key={field.name}>
            <div className="mb-2 font-bold">{t(field.name)}</div>

            <div
              className={clsx(
                "flex",
                field.name === "picture" ? "flex-row gap-4" : "flex-col",
              )}
            >
              {field.values.map((value) => (
                <div className="form-control" key={value}>
                  <label className="label cursor-pointer justify-normal gap-4">
                    <input
                      className="radio"
                      type="radio"
                      {...register(field.name)}
                      value={value || undefined}
                    />
                    {field.name === "picture" ? (
                      <img
                        alt="blabla"
                        className="h-20"
                        src={`/uploads/${value}`}
                      />
                    ) : (
                      <span className="label-text">{t(`${value}`)}</span>
                    )}
                  </label>
                </div>
              ))}

              <div className="form-control">
                <label className="label cursor-pointer justify-normal gap-4">
                  <input
                    className="radio"
                    type="radio"
                    {...register(field.name)}
                    value=""
                  />
                  {field.name === "picture" ? (
                    <div className="aspect-square h-20 text-center italic ring flex-center">
                      Aucune photo
                    </div>
                  ) : (
                    <span className="label-text italic">(vide)</span>
                  )}
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky inset-x-0 bottom-0 gap-4 bg-base-200 py-6 flex-center">
        <button
          className="btn btn-sm"
          onClick={() => {
            onClose();
          }}
          type="button"
        >
          Fermer
        </button>
        <button className="btn btn-outline btn-sm" type="submit">
          Approuver
        </button>
      </div>
    </form>
  );
}

export default MergeForm;
