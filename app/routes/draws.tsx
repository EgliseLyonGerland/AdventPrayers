import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import Header from "~/components/hearder";
import { getDraws } from "~/models/draw.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const draws = await getDraws();

  return json({ draws });
};

export default function Draws() {
  const { draws } = useLoaderData<typeof loader>();

  return (
    <div className="px-8 pb-10">
      <Header draws={draws} />
      <Outlet />
    </div>
  );
}
