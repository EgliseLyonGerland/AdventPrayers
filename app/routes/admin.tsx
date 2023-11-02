import { Bars3Icon } from "@heroicons/react/24/outline";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet } from "@remix-run/react";
import { type LoaderFunctionArgs } from "react-router";

import Logo from "~/components/logo";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  return json({});
};

export default function Admin() {
  return (
    <div className="drawer min-h-screen w-screen overflow-x-hidden lg:drawer-open">
      <input className="drawer-toggle" id="drawer" type="checkbox" />
      <div className="drawer-content flex overflow-x-hidden">
        <div className="bg-base-200">
          <label
            className="btn btn-circle btn-primary btn-ghost drawer-button btn-lg lg:hidden"
            htmlFor="drawer"
          >
            <Bars3Icon className="h-8" />
          </label>
        </div>
        <div className="flex-1 overflow-x-hidden px-8">
          <Outlet />
        </div>
      </div>
      <div className="drawer-side z-50">
        <label
          aria-label="close sidebar"
          className="drawer-overlay"
          htmlFor="drawer"
        />
        <div className="w-64"> </div>
        <div className="fixed flex h-screen min-h-full w-64 flex-col gap-8 overflow-y-auto bg-base-200 px-6 py-8">
          <div className="border-b border-base-content/20 pb-4">
            <Link className="mx-auto block w-40 self-center" to="/admin">
              <Logo className="my-2 w-full fill-base-content" />
            </Link>
          </div>

          <ul className="menu rounded-box w-full space-y-4 bg-base-200 p-0">
            <li>
              <NavLink className="rounded-full" to="/admin/draws">
                Tirages
              </NavLink>
            </li>
            <li>
              <NavLink className="rounded-full" to="/admin/persons">
                Personnes
              </NavLink>
            </li>
            <li>
              <NavLink className="rounded-full" to="/admin/emails">
                Emails
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
