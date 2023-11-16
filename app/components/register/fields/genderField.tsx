import { useRemixFormContext } from "remix-hook-form";

import t from "~/utils/i18n";

const genders = ["female", "male"];

export default function GenderField() {
  const { register } = useRemixFormContext();

  return (
    <div className="mx-auto flex flex-wrap gap-4 md:flex-row md:justify-center md:gap-12">
      {genders.map((gender) => (
        <div className="form-control" key={gender}>
          <label className="label flex cursor-pointer items-center justify-center gap-6">
            <input
              {...register("gender")}
              className="radio-secondary radio radio-lg"
              type="radio"
              value={gender}
            />
            <span className="label-text text-2xl md:text-4xl">{t(gender)}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
