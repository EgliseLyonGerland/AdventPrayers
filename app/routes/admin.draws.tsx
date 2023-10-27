import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import Header from "~/components/hearder";
import { getDraws } from "~/models/draw.server";

export const loader = async () => {
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
