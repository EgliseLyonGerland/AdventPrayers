import { useRemixFormContext } from "remix-hook-form";

import TextInput from "../inputs/textInput";

export default function LastNameField() {
  const { register } = useRemixFormContext();

  return <TextInput placeholder="Nom" {...register("lastName")} />;
}
