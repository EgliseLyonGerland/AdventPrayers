import clsx from "clsx";
import { useForm } from "react-hook-form";

import { type Person } from "~/models/person.server";
import t from "~/utils/i18n";

interface Props {
  persons: Person[];
  onSubmit: (data: Person) => void;
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

function MergeForm({ persons, onSubmit }: Props) {
  const fields = attributes.map((name) => ({
    name,
    values: [...new Set(persons.map((person) => person[name]).filter(Boolean))],
  }));

  const { register, handleSubmit } = useForm<Person>({
    defaultValues: fields.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: curr.values[0] || null,
      }),
      {},
    ),
  });

  return (
    <form
      className="flex flex-col divide-y divide-base-content/10"
      onSubmit={handleSubmit(onSubmit)}
    >
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
          </div>
        </div>
      ))}

      <button className="btn btn-secondary mt-6" type="submit">
        Fusionner
      </button>
    </form>
  );
}

export default MergeForm;
