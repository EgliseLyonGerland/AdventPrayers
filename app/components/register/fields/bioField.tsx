import { useRemixFormContext } from "remix-hook-form";

import TextareaInput from "../inputs/textareaInput";

export default function BioField({ className }: { className?: string }) {
  const { register } = useRemixFormContext();

  return (
    <TextareaInput
      className={className}
      placeholder="Quelques informations, sujets de prière, ..."
      {...register("bio")}
    />
  );
}
