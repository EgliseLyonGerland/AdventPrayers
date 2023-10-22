import { useRemixFormContext } from "remix-hook-form";

import t from "~/utils/i18n";

const genders = ["female", "male"];

export default function GenderField() {
  const { register } = useRemixFormContext();

  return (
    <div className="flex gap-6 md:gap-12 md:justify-center flex-wrap flex-col md:flex-row">
      {genders.map((gender) => (
        <div className="form-control" key={gender}>
          <label className="label cursor-pointer flex gap-8 items-center justify-center">
            <input
              {...register("gender")}
              type="radio"
              className="radio radio-lg radio-accent"
              value={gender}
            />
            <span className="label-text text-2xl md:text-4xl">{t(gender)}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
