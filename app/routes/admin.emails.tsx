import { render } from "@react-email/render";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import AdminRegistationAdded from "~/components/emails/AdminRegistationAdded";
import AdminRegistationDeleted from "~/components/emails/AdminRegistationDeleted";
import RegistrationApprovedEmail from "~/components/emails/registationApproved";
import RegistrationRecordedEmail from "~/components/emails/registrationRecorded";
import UnregisteredEmail from "~/components/emails/unregistered";
import { type Person } from "~/models/person.server";
import { getUser } from "~/session.server";
import { sendEmail } from "~/utils/email.server";

const templates = {
  adminRegistrationAdded: AdminRegistationAdded,
  adminRegistrationDeleted: AdminRegistationDeleted,
  registered: RegistrationRecordedEmail,
  registrationValidated: RegistrationApprovedEmail,
  unregistered: UnregisteredEmail,
} as const;

function isTemplate(name: string): name is keyof typeof templates {
  return name in templates;
}

function renderTemplate(name: keyof typeof templates) {
  const person: Person = {
    id: "123456",
    firstName: "Marie",
    lastName: "Bonneville",
    age: "18+",
    gender: "female",
    email: "marie.bonneville@example.com",
    bio: `Tempor in aute ut ullamco commodo deserunt voluptate non Lorem fugiat veniam laborum deserunt nisi. Consectetur aliqua qui nulla aliqua sunt quis deserunt aliquip. Elit aute minim nulla incididunt minim ad enim deserunt. Et consequat adipisicing consequat qui proident nulla anim irure non cillum Lorem sit deserunt.

Lorem esse occaecat nostrud adipisicing voluptate do nulla. Duis ex elit dolore magna velit exercitation reprehenderit qui anim duis excepteur esse aliquip eu. Sint nulla excepteur cupidatat exercitation pariatur nostrud consequat dolore eiusmod. Lorem proident culpa pariatur incididunt duis non duis ex cillum dolore quis. Nisi cillum officia aliquip aliquip incididunt et.`,
    picture: "clo6yrcoy000a3b6qo3qaw5k7.png",
  };

  const Component = templates[name];
  return render(<Component person={person} />);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const user = await getUser(request);

  const template = formData.get("template")?.toString();

  invariant(template, "Template not found (1)");
  invariant(isTemplate(template), "Template not found (2)");
  invariant(user);

  const Component = templates[template];

  sendEmail({
    body: renderTemplate(template),
    subject: Component.title,
    to: { address: user.email, name: user.email },
    test: true,
  });

  return json({});
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  invariant(user);

  return json({ user });
};

export default function Email() {
  const [currentTemplate, setCurrentTemplate] = useState<string>("registered");

  const doc = isTemplate(currentTemplate)
    ? renderTemplate(currentTemplate)
    : null;

  return (
    <div className="flex min-h-full flex-col py-8">
      <div className="flex pb-4">
        <select
          className="select select-bordered select-sm"
          onChange={(event) => {
            setCurrentTemplate(event.currentTarget.value);
          }}
          value={currentTemplate}
        >
          {Object.entries(templates).map(([name, template]) => (
            <option key={name} value={name}>
              {template.title}
            </option>
          ))}
        </select>
        <Form className="ml-auto" method="post">
          <input name="template" type="hidden" value={currentTemplate} />
          <button
            className="btn btn-secondary btn-outline btn-sm"
            disabled={!doc}
            type="submit"
          >
            Envoyer un email de test
          </button>
        </Form>
      </div>
      <iframe
        className="min-h-full w-full flex-1 rounded-xl border border-base-content/10"
        srcDoc={doc || "No template found"}
        title="Template"
      />
    </div>
  );
}
