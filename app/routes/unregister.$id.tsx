import { render } from "@react-email/components";
import {
  type LoaderFunctionArgs,
  redirect,
  json,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import invariant from "tiny-invariant";

import AdminRegistationDeleted from "~/components/emails/adminRegistationDeleted";
import UnregisteredEmail from "~/components/emails/unregistered";
import SimplePage from "~/components/simplePage";
import { AppName } from "~/config";
import {
  deleteRegistration,
  getRegistration,
} from "~/models/registrations.server";
import { sendEmail } from "~/utils/email.server";

export async function action({ params }: ActionFunctionArgs) {
  const { id } = params;
  invariant(id);

  const registration = await getRegistration(id);

  if (!registration) {
    throw new Response(null, {
      status: 404,
      statusText: "On ne se connaît pas je pense",
    });
  }

  await deleteRegistration(id);

  if (registration.email) {
    sendEmail({
      body: render(<UnregisteredEmail person={registration} />),
      subject: UnregisteredEmail.title,
      to: {
        address: registration.email,
        name: registration.firstName,
      },
    });
  }

  sendEmail({
    body: render(<AdminRegistationDeleted person={registration} />),
    subject: AdminRegistationDeleted.title,
    to: [{ address: "enaventlapriere@egliselyongerland.org", name: AppName }],
  });

  return redirect("/unregister/ok");
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  invariant(id);

  const registration = await getRegistration(id);

  if (!registration) {
    throw new Response(null, {
      status: 404,
      statusText: "On ne se connaît pas je pense",
    });
  }

  if (registration.approved) {
    return redirect(`/me/${registration.personId}`);
  }

  return json({});
}

export default function Registration() {
  return (
    <SimplePage heading="😭😭😭">
      <div className="whitespace-nowrap font-serif italic leading-relaxed">
        Un clic, une danse, une désinscription,
        <br />
        Comme un pas de valse, une petite action.
        <br />
        Le bouton t’attend, plein d’émotion,
        <br />
        Confirme-le vite, sois prompt sans dévotion !
      </div>
      <div>— Tchate Gipiti</div>
      <Form method="post">
        <button
          className="btn btn-secondary btn-outline btn-lg mt-4 w-full"
          type="submit"
        >
          Confirmer
        </button>
      </Form>
    </SimplePage>
  );
}
