import { type ReactNode } from "react";

interface Props {
  title?: string;
  children: ReactNode;
}

export default function Box({ title, children }: Props) {
  return (
    <div className="w-full max-w-3xl flex-col gap-8 rounded-xl bg-base-200 p-4 py-8 text-center shadow-xl flex-center wrap-balance md:p-8 md:py-12">
      {title ? (
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      ) : null}
      {children}
    </div>
  );
}
