import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  type LoaderFunctionArgs,
  json,
  redirect,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  type NodeOnDiskFile,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { createFormData, getValidatedFormData } from "remix-hook-form";
import invariant from "tiny-invariant";

import Form from "~/components/register/form";
import schema, { type Schema } from "~/components/register/schema";
import { updatePlayerAge } from "~/models/draw.server";
import { getPerson, updatePerson } from "~/models/person.server";
import { getCurrentYear } from "~/utils";

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  invariant(id);

  const formData = await unstable_parseMultipartFormData(
    request.clone(),
    unstable_createFileUploadHandler({
      directory: process.env.UPLOADS_DIR,
      maxPartSize: 5_000_000,
    }),
  );

  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<Schema>(request, valibotResolver(schema));

  if (errors) {
    return json({ errors, defaultValues });
  }

  const picture = formData.get("picture") as NodeOnDiskFile | null;

  await updatePerson(id, {
    ...data,
    picture: picture?.name || data.picture,
  });

  await updatePlayerAge({
    year: getCurrentYear(),
    age: data.age,
    id,
  });

  return redirect("..");
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  invariant(id);

  const person = await getPerson(id);
  invariant(person);

  return json({ person });
};

export default function MeEdit() {
  const { person } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleSubmit = (data: Schema) => {
    const formData = createFormData(data);
    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  return (
    <div className="relative w-full flex-1 px-6 pb-2 md:px-12 md:pb-0">
      <Form onSubmit={handleSubmit} person={person} />
    </div>
  );
}
