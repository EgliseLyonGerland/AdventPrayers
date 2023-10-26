import clsx from "clsx";
import { ReactNode } from "react";

export function Wrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "h-full px-4 py-8 pt-36 def:overflow-hidden md:px-8 md:py-12 md:pt-64",
        className,
      )}
    >
      {children}
    </div>
  );
}