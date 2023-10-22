import { useRemixFormContext } from "remix-hook-form";

import TextareaInput from "../inputs/textareaInput";

export default function BioField() {
  const { register } = useRemixFormContext();

  return (
    <TextareaInput
      placeholder="Quelques informations, sujets de prière, ..."
      {...register("bio")}
    />
  );
}
