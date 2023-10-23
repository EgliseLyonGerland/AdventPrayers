import { useRemixFormContext } from "remix-hook-form";

import t from "~/utils/i18n";

const genders = ["female", "male"];

export default function GenderField() {
  const { register } = useRemixFormContext();

  return (
    <div className="flex flex-col flex-wrap gap-6 md:flex-row md:justify-center md:gap-12">
      {genders.map((gender) => (
        <div className="form-control" key={gender}>
          <label className="label flex cursor-pointer items-center justify-center gap-8">
            <input
              {...register("gender")}
              className="radio-accent radio radio-lg"
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
