import clsx from "clsx";
import { ReactNode } from "react";

import Logo from "../logo";

interface Props {
  children: ReactNode[];
}

export default function Message({ children }: Props) {
  return (
    <div className="flex-1 flex-col gap-8 p-8 flex-center md:gap-12 md:p-16">
      <Logo className="h-16 md:h-32" />
      <div className="my-auto max-w-2xl space-y-8 text-center text-lg leading-relaxed wrap-balance md:text-xl">
        {children.map((child, index) => (
          <div
            className={clsx(index === 0 && "text-[1.2em] font-bold")}
            key={index}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
