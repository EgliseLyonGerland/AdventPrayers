import { type ReactNode } from "react";

interface Props {
  alt: ReactNode;
  children: ReactNode;
}

export default function Text({ alt, children }: Props) {
  return (
    <span>
      <span className="md:hidden">{alt}</span>
      <span className="max-md:hidden">{children}</span>
    </span>
  );
}
