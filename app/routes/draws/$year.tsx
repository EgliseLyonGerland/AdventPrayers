import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useLoaderData, useMatches } from "@remix-run/react";
import { Outlet } from "@remix-run/react";
import clsx from "clsx";

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
  const matches = useMatches();

  const currentRoute = matches[matches.length - 1];

  const routes = [
    { path: `/draws/${year}/players`, label: "Participants" },
    { path: `/draws/${year}/mails`, label: "Messages" },
  ];

  return (
    <main className="container mx-auto px-4">
      <div className="my-12 flex">
        <h1 className="mr-8 text-4xl">Tirage {year}</h1>

        <div className="tabs">
          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={clsx("tab tab-bordered", {
                "tab-active": currentRoute.pathname === route.path,
              })}
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
