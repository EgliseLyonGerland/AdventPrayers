import { render } from "@react-email/render";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";

import { templates, templatesComponent } from "~/components/emails";
import { type Person } from "~/models/person.server";
import { type Registration } from "~/models/registrations.server";
import { getUser } from "~/session.server";
import { generateEmailFromTemplate, isTemplate } from "~/utils/email";
import { sendEmail } from "~/utils/email.server";

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

const assignedPerson: Person = {
  id: "654321",
  firstName: "Raymond",
  lastName: "Laporte",
  age: "18+",
  gender: "male",
  email: "raymond.laporte@example.com",
  bio: `Amet sunt qui aliquip anim culpa reprehenderit. In nulla magna pariatur culpa labore nulla esse. Duis proident culpa ad pariatur. Tempor culpa sit duis est sit amet incididunt ea. Fugiat veniam et deserunt pariatur Lorem pariatur dolor proident. Sunt adipisicing elit aliquip eu sint veniam ad anim minim ut incididunt labore. Consectetur nisi exercitation incididunt consectetur irure non non irure sint deserunt proident ipsum labore enim.

Commodo elit est id eu. Mollit commodo non incididunt fugiat. Culpa reprehenderit deserunt deserunt non duis est.`,
  picture: "clo6yrcoy000j3b6q6zezx0np.png",
};

const registration: Registration = {
  ...person,
  drawYear: 2023,
  registeredAt: new Date(),
  approved: false,
  personId: "",
};

function renderTemplate(name: keyof typeof templatesComponent) {
  return render(
    generateEmailFromTemplate(name, {
      registration,
      person,
      assignedPerson,
      message: `In ad ex ex minim est amet velit. Occaecat sit id amet dolore cillum mollit voluptate nisi deserunt velit nulla id eiusmod cupidatat. Deserunt ullamco labore ipsum proident eu cupidatat ullamco amet voluptate fugiat.

    Anim nulla irure incididunt pariatur tempor non reprehenderit tempor dolor sit ea. Amet in sint in cupidatat magna laboris magna elit occaecat tempor id ullamco anim. Dolor non Lorem ad excepteur velit deserunt magna ea anim fugiat deserunt qui culpa sunt. Qui irure elit ut exercitation non ipsum duis enim commodo. Do ea mollit aliquip id laboris reprehenderit in. Nulla proident sit ad proident ea veniam. Lorem incididunt id laborum mollit consectetur ad proident.`,
    }),
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const user = await getUser(request);

  const template = formData.get("template")?.toString();

  invariant(template, "Template not found (1)");
  invariant(isTemplate(template), "Template not found (2)");
  invariant(user);

  const Component = templatesComponent[template];

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
  const [searchParams, setSearchParams] = useSearchParams({
    template: templates[0][0],
  });

  const currentTemplate = searchParams.get(
    "template",
  ) as keyof typeof templatesComponent;

  const doc = isTemplate(currentTemplate)
    ? renderTemplate(currentTemplate)
    : null;

  return (
    <div className="flex min-h-full flex-col py-8">
      <div className="flex pb-4">
        <select
          className="select select-bordered select-sm"
          onChange={(event) => {
            if (isTemplate(event.currentTarget.value)) {
              setSearchParams({ template: event.currentTarget.value });
            }
          }}
          value={currentTemplate}
        >
          {templates.map(([name, template]) => (
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
