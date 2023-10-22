import { useRemixFormContext } from "remix-hook-form";

import TextInput from "../inputs/textInput";

export default function FirstNameField() {
  const { register } = useRemixFormContext();

  return <TextInput placeholder="Prénom" {...register("firstName")} />;
}
