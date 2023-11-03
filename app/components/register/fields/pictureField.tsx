import { ArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { useRemixFormContext } from "remix-hook-form";

export default function PictureField() {
  const { control, trigger } = useRemixFormContext<{ picture?: File }>();
  const {
    field: { value, onChange, ...field },
  } = useController({ name: "picture", control });
  const [picture, setPicture] = useState<string>();

  useEffect(() => {
    setPicture(value ? URL.createObjectURL(value) : undefined);
  }, [value]);

  return (
    <label
      className="group relative mx-auto block aspect-square h-[20vh] cursor-pointer rounded-lg border-2 border-dashed border-base-content/50 p-2 shadow-xl flex-center hover:border-secondary hover:bg-base-200 md:h-[25vh]"
      htmlFor="picture"
    >
      {picture ? (
        <img
          alt="selected"
          className="h-full w-full object-contain"
          src={picture}
        />
      ) : (
        <ArrowDownIcon
          className="transition-transform group-hover:translate-y-2"
          height="10vh"
        />
      )}

      {picture ? (
        <button
          className="btn btn-circle absolute right-4 top-4"
          onClick={() => {
            onChange(null);
            trigger();
          }}
          type="button"
        >
          <TrashIcon className="h-6" />
        </button>
      ) : null}

      <input
        accept="image/png, image/gif, image/jpeg"
        className="absolute h-0 w-0 opacity-0"
        id="picture"
        multiple={false}
        onChange={(event) => {
          onChange(event.target.files?.[0]);
          trigger();
        }}
        type="file"
        {...field}
      />
    </label>
  );
}
