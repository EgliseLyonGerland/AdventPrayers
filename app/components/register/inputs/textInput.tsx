import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"input">;

export default forwardRef<HTMLInputElement, Props>(
  function TextInput(inputProps, ref) {
    return (
      <input
        {...inputProps}
        autoComplete="false"
        className="input h-20 w-full border-2 bg-neutral text-center text-2xl shadow-xl focus:input-accent placeholder:opacity-50 focus:outline-0 md:h-24 md:text-3xl"
        ref={ref}
        type="input"
      />
    );
  },
);
