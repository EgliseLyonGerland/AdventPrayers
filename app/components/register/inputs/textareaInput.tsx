import { type ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"textarea">;

export default forwardRef<HTMLTextAreaElement, Props>(
  function TextareaInput(input, ref) {
    return (
      <div className="relative h-[20svh]">
        <textarea
          {...input}
          className="input input-lg absolute z-40 h-full w-full resize-none rounded-3xl border-2 bg-base-200 py-4 text-lg shadow-xl transition-[height] focus:input-secondary placeholder:opacity-50 focus:h-[40svh] focus:shadow-2xl focus:outline-0 md:text-xl"
          ref={ref}
        />
      </div>
    );
  },
);
