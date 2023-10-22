import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  NavLink,
  useLoaderData,
  useMatches,
  Outlet,
  Form,
  useNavigation,
} from "@remix-run/react";
import clsx from "clsx";

import { createDraw, getDraw } from "~/models/draw.server";
import { getYearParam } from "~/utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const year = getYearParam(params);
  await createDraw({ year });

  return json({});
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });

  return json({ year, draw });
};

export default function Index() {
  const { year, draw } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
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
              className={clsx(
                "tab tab-bordered",
                currentRoute.pathname === route.path && "tab-active",
                !draw && "opacity-40 pointer-events-none",
              )}
              key={route.path}
              to={route.path}
            >
              {route.label}
            </NavLink>
          ))}
        </div>
      </div>
      {draw ? (
        <Outlet />
      ) : (
        <Form method="post">
          <div className="hero bg-base-200 p-8 container mx-auto">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-2xl font-bold">
                  L‘édition n‘existe pas encore...
                </h1>
                <p className="py-6 text-lg opacity-70">
                  Tu dois d‘abord la créer avant de pouvoir ajouter des
                  participants et lancer le tirage.
                </p>
                <button className="btn btn-secondary" type="submit">
                  {navigation.state === "submitting" ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    `Créer l‘édition ${year}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </main>
  );
}
