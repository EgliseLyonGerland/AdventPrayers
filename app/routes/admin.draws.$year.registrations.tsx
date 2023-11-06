import { XMarkIcon } from "@heroicons/react/24/outline";
import { render } from "@react-email/components";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import invariant from "tiny-invariant";

import PersonRecord from "~/components/admin/personRecord";
import CheckForm from "~/components/admin/registrations/checkForm";
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
  getRegistrations,
} from "~/models/registrations.server";
import { getYearParam } from "~/utils";
import { sendEmail } from "~/utils/email.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const year = getYearParam(params);
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "approve": {
      const registrationId = formData.get("id");
      const linkTo = formData.get("linkTo")?.toString();
      const data = JSON.parse(
        formData.get("data")?.toString() || "{}",
      ) as Person;

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
        sendEmail({
          body: render(<RegistrationApprovedEmail person={person} />),
          subject: RegistrationApprovedEmail.title,
          to: {
            address: person.email,
            name: person.firstName,
          },
        });
      }
      break;
    }

    case "delete": {
      const registrationId = formData.get("id");
      invariant(registrationId);
      await deleteRegistration(registrationId.toString());
      break;
    }
  }

  return json({});
}

export async function loader({ params }: LoaderFunctionArgs) {
  const year = getYearParam(params);
  const registrations = await getRegistrations(year);
  const persons = await getPersons();

  return json({ registrations, persons });
}

export default function Registrations() {
  const { registrations, persons } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [currentPerson, setCurrentPerson] = useState<Person>();

  if (registrations.length === 0) {
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
      <table className="table table-zebra z-0 w-full self-start text-base">
        <tbody>
          {registrations.map((registration) => (
            <tr
              className={clsx(
                "hover cursor-pointer",
                currentPerson === registration && "ring-2 ring-inset",
              )}
              key={registration.id}
              onClick={() => {
                setCurrentPerson(
                  currentPerson === registration ? undefined : registration,
                );
              }}
            >
              <td className="w-full align-middle">
                <PersonRecord person={registration} />
              </td>
              <td>
                <Form method="post">
                  <input name="id" type="hidden" value={registration.id} />
                  <button
                    className="btn btn-circle btn-ghost"
                    name="_action"
                    onClick={() => {
                      setCurrentPerson(
                        currentPerson === registration
                          ? undefined
                          : registration,
                      );
                    }}
                    type="submit"
                    value="delete"
                  >
                    <XMarkIcon className="h-6" />
                  </button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {currentPerson ? (
        <div className="rounded-box h-full w-[40vw] min-w-[500px] overflow-hidden bg-base-200">
          <motion.div
            animate={{ opacity: 1 }}
            className="overflow-y-auto"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CheckForm
              checkingPerson={currentPerson}
              onClose={() => {
                setCurrentPerson(undefined);
              }}
              onSubmit={(data, linkTo) => {
                const formData = new FormData();
                formData.set("_action", "approve");
                formData.set("id", currentPerson.id);
                formData.set("data", JSON.stringify(data));

                if (linkTo) {
                  formData.set("linkTo", linkTo);
                }

                submit(formData, { method: "post" });
                setCurrentPerson(undefined);
              }}
              persons={persons}
            />
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
