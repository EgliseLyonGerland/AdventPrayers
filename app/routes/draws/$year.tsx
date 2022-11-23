import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Outlet } from "@remix-run/react";

import { getYearParam } from "~/utils";

type LoaderData = {
  year: number;
};

export const loader: LoaderFunction = async ({ params }) => {
  const year = getYearParam(params);
  return json({ year });
};

export default function Index() {
  const { year } = useLoaderData<LoaderData>();

  return (
    <main className="container mx-auto px-4">
      <h1 className="my-12 text-4xl">Tirage {year}</h1>
      <Outlet />
    </main>
  );
}
