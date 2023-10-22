import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"textarea">;

export default forwardRef<HTMLTextAreaElement, Props>(
  function TextareaInput(input, ref) {
    return (
      <div className="relative h-32 md:h-[20vh] group z-40">
        <div className="opacity-0 group-focus-within:opacity-100 fixed top-0 left-0 w-full h-full bg-base-300/80 transition-opacity"></div>
        <textarea
          {...input}
          className={clsx(
            "w-full h-full input focus:input-accent focus:outline-0 border-2 text-lg md:text-2xl input-lg bg-neutral shadow-xl placeholder:opacity-50 rounded-3xl py-4 resize-none",
            "absolute focus:h-[40vh] transition-[height]",
          )}
          ref={ref}
        />
      </div>
    );
  },
);
