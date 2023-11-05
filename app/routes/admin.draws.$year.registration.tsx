import { render } from "@react-email/components";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import invariant from "tiny-invariant";

import PersonRecord from "~/components/admin/personRecord";
import CheckForm from "~/components/admin/registration/checkForm";
import RegistrationApprovedEmail from "~/components/emails/registationApproved";
import { addPlayer } from "~/models/draw.server";
import {
  getPersons,
  updatePerson,
  type Person,
  createPerson,
} from "~/models/person.server";
import {
  deleteRegistration,
  getRegiration,
} from "~/models/registration.server";
import { getYearParam } from "~/utils";
import { sendEmail } from "~/utils/email.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const year = getYearParam(params);
  const formData = await request.formData();

  const registrationId = formData.get("registrationId");
  const linkTo = formData.get("linkTo")?.toString();
  const data = JSON.parse(formData.get("data")?.toString() || "{}") as Person;

  invariant(registrationId);

  let person;

  if (linkTo) {
    person = await updatePerson(linkTo, data);
  } else {
    person = await createPerson(data);
  }

  await addPlayer({ year, id: person.id, age: person.age });
  await deleteRegistration(registrationId.toString());

  if (person.email) {
    await sendEmail({
      body: render(<RegistrationApprovedEmail person={person} />),
      subject: RegistrationApprovedEmail.title,
      to: {
        address: person.email,
        name: person.firstName,
      },
    });
  }

  return json({});
}

export async function loader({ params }: LoaderFunctionArgs) {
  const year = getYearParam(params);
  const registration = await getRegiration(year);
  const persons = await getPersons();

  return json({ registration, persons });
}

export default function Registration() {
  const { registration, persons } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [currentPerson, setCurrentPerson] = useState<Person>();

  if (registration.length === 0) {
    return (
      <div className="hero mt-4 bg-base-200 p-8">
        <div className="hero-content text-center">
          Aucune inscription en attente
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-6">
      <table className="table table-zebra z-0 w-full self-start rounded-xl text-base">
        <tbody>
          {registration.map((person) => (
            <tr key={person.id}>
              <td className="w-full align-middle">
                <PersonRecord person={person} />
              </td>
              <td>
                <button
                  className={clsx(
                    "btn btn-sm",
                    currentPerson === person && "btn-secondary btn-outline",
                  )}
                  onClick={() => {
                    setCurrentPerson(
                      currentPerson === person ? undefined : person,
                    );
                  }}
                >
                  Approuver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {currentPerson ? (
        <div className="min-h-full w-[40vw] min-w-[500px] overflow-y-auto bg-base-200 p-8">
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CheckForm
              checkingPerson={currentPerson}
              onSubmit={(data, linkTo) => {
                const formData = new FormData();
                formData.set("registrationId", currentPerson.id);
                formData.set("data", JSON.stringify(data));

                if (linkTo) {
                  formData.set("linkTo", linkTo);
                }

                submit(formData, { method: "post" });
              }}
              persons={persons}
            />
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
