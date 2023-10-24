import clsx from "clsx";
import { ComponentProps, forwardRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = ComponentProps<"textarea">;

export default forwardRef<HTMLTextAreaElement, Props>(
  function TextareaInput(input, ref) {
    const [focus, setFocus] = useState(false);

    return (
      <div className="relative z-40 h-32 md:h-[20vh]">
        {typeof document !== "undefined"
          ? createPortal(
              <div
                className={clsx(
                  "fixed left-0 top-0 h-full w-full bg-base-300/80 opacity-0 transition-opacity",
                  focus && "opacity-100",
                )}
              ></div>,
              document.body,
            )
          : null}
        <textarea
          {...input}
          className={clsx(
            "input input-lg h-full w-full resize-none rounded-3xl border-2 bg-neutral py-4 text-lg shadow-xl focus:input-accent placeholder:opacity-50 focus:outline-0 md:text-2xl",
            "absolute transition-[height] focus:h-[40vh]",
          )}
          onBlur={(event) => {
            input.onBlur?.(event);
            setFocus(false);
          }}
          onFocus={(event) => {
            input.onFocus?.(event);
            setFocus(true);
          }}
          ref={ref}
        />
      </div>
    );
  },
);
