import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"textarea">;

export default forwardRef<HTMLTextAreaElement, Props>(
  function TextareaInput(input, ref) {
    return (
      <div className="group relative z-40 h-32 md:h-[20vh]">
        <div className="fixed left-0 top-0 h-full w-full bg-base-300/80 opacity-0 transition-opacity group-focus-within:opacity-100"></div>
        <textarea
          {...input}
          className={clsx(
            "input input-lg h-full w-full resize-none rounded-3xl border-2 bg-neutral py-4 text-lg shadow-xl focus:input-accent placeholder:opacity-50 focus:outline-0 md:text-2xl",
            "absolute transition-[height] focus:h-[40vh]",
          )}
          ref={ref}
        />
      </div>
    );
  },
);
