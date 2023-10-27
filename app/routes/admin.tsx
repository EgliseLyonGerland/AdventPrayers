import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { LoaderFunctionArgs } from "react-router";

import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  return json({});
};

export default function Admin() {
  return <Outlet />;
}
