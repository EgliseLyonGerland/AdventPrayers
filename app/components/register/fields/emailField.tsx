import { useRemixFormContext } from "remix-hook-form";

import TextInput from "../inputs/textInput";

export default function EmailField() {
  const { register } = useRemixFormContext();

  return (
    <TextInput
      placeholder="Adresse email"
      type="email"
      {...register("email")}
    />
  );
}
