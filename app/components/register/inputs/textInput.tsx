import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"input">;

export default forwardRef<HTMLInputElement, Props>(
  function TextInput(inputProps, ref) {
    return (
      <input
        {...inputProps}
        type="input"
        className="w-full input focus:input-accent focus:outline-0 border-2 md:text-3xl text-2xl h-20 md:h-24 text-center bg-neutral shadow-xl placeholder:opacity-50"
        ref={ref}
        autoComplete="false"
      />
    );
  },
);
