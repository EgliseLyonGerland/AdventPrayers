import { useRemixFormContext } from "remix-hook-form";

const ages = ["18+", "14-17", "10-13", "6-9"];

export default function AgeField() {
  const { register } = useRemixFormContext();

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-[auto_auto] gap-6 md:gap-20">
        {ages.map((age) => (
          <div className="form-control" key={age}>
            <label className="label flex cursor-pointer items-center justify-start gap-8">
              <input
                {...register("age")}
                className="radio-accent radio radio-lg"
                type="radio"
                value={age}
              />
              <span className="label-text text-2xl md:text-4xl">{age}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
