import { forwardRef, type ComponentProps } from "react";

export default forwardRef<SVGSVGElement, ComponentProps<"svg">>(
  function MaleIcon(props, ref) {
    return (
      <svg
        fill="currentColor"
        ref={ref}
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.871 6.836a5 5 0 1 1-.707-.707L13.293 2H9.5zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
          fillRule="evenodd"
        />
      </svg>
    );
  },
);
