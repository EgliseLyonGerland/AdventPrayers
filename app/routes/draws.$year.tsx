import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useLoaderData, useMatches, Outlet } from "@remix-run/react";
import clsx from "clsx";

import { getYearParam } from "~/utils";

interface LoaderData {
  year: number;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  return json({ year });
};

export default function Index() {
  const { year } = useLoaderData<LoaderData>();
  const matches = useMatches();

  const currentRoute = matches[matches.length - 1];

  const routes = [
    { path: `/draws/${year}/players`, label: "Participants" },
    { path: `/draws/${year}/mails`, label: "Messages" },
    { path: `/draws/${year}/print`, label: "Impression" },
  ];

  return (
    <main className="flex flex-1 flex-col px-4">
      <div className="container mx-auto mb-12 flex">
        <h1 className="mr-8 text-2xl font-bold">Édition {year}</h1>

        <div className="tabs">
          {routes.map((route) => (
            <NavLink
              className={clsx("tab tab-bordered", {
                "tab-active": currentRoute.pathname === route.path,
              })}
              key={route.path}
              to={route.path}
            >
              {route.label}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </main>
  );
}
