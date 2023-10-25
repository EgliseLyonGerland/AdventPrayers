import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"textarea">;

export default forwardRef<HTMLTextAreaElement, Props>(
  function TextareaInput(input, ref) {
    return (
      <div className="relative h-32 md:h-[20vh]">
        <textarea
          {...input}
          className="input input-lg absolute z-40 h-full w-full resize-none rounded-3xl border-2 bg-base-200 py-4 text-lg shadow-xl transition-[height] focus:input-accent placeholder:opacity-50 focus:h-[40vh] focus:shadow-2xl focus:outline-0 md:text-2xl"
          ref={ref}
        />
      </div>
    );
  },
);
