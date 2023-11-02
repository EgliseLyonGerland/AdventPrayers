import { render } from "@react-email/render";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import RegisteredEmail from "~/components/emails/registered";
import { getUser } from "~/session.server";
import { sendEmail } from "~/utils/email.server";

const templates = {
  registered: {
    label: "Registered",
    Component: RegisteredEmail,
  },
} as const;

function isTemplate(name: string): name is keyof typeof templates {
  return name in templates;
}

function renderTemplate(name: keyof typeof templates) {
  const { Component } = templates[name];

  switch (name) {
    case "registered": {
      return render(<Component firstName="Marie" id="123456" />);
    }

    default:
      return "";
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const user = await getUser(request);

  const template = formData.get("template")?.toString();

  invariant(template, "Template not found (1)");
  invariant(isTemplate(template), "Template not found (2)");
  invariant(user);

  const { label } = templates[template];

  sendEmail({
    body: renderTemplate(template),
    subject: `Template: ${label}`,
    to: {
      address: user.email,
      name: user.email,
    },
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
            <option key={name}>{template.label}</option>
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