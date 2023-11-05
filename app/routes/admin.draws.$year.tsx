import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  Form,
  useNavigation,
  useNavigate,
  NavLink,
} from "@remix-run/react";
import clsx from "clsx";
import { Fragment } from "react";

import { createDraw, getDraw, getDraws } from "~/models/draw.server";
import { getCurrentYear, getYearParam } from "~/utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const year = getYearParam(params);
  await createDraw({ year });

  return json({});
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });
  const draws = await getDraws();

  return json({ year, draw, draws });
};

const routes = [
  { path: "players", label: "Participants" },
  { path: "registration", label: "Inscriptions" },
  { path: "mails", label: "Messages" },
  { path: "print", label: "Impression" },
];

export default function Index() {
  const { year, draw, draws } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const currentYear = getCurrentYear();
  const years = draws.map(({ year }) => year).sort((a, b) => a - b);
  if (years[years.length - 1] !== currentYear) {
    years.push(currentYear);
  }

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden pb-8">
      <div className="navbar sticky top-0 z-30 mb-8 border-b border-b-base-content/10 bg-base-100 px-0 text-neutral-content">
        <div className="w-full space-x-4">
          <Listbox
            as="div"
            className="dropdown dropdown-open"
            onChange={(value) => {
              navigate(`/admin/draws/${value}`);
            }}
            value={year}
          >
            <Listbox.Button as="label" className="btn btn-sm">
              Édition {year}
              <ChevronDownIcon className="ml-2" height={16} />
            </Listbox.Button>
            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Listbox.Options
                as="ul"
                className="menu dropdown-content rounded-box w-52 border border-base-content/10 bg-base-200 p-2 shadow"
              >
                {years.map((item) => (
                  <Listbox.Option as="li" key={item} value={item}>
                    <span className="min-w-[160px]">{item}</span>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </Listbox>

          <div className="tabs-boxed tabs">
            {routes.map((route) => (
              <NavLink
                className={({ isActive }) =>
                  clsx(
                    "tab tab-sm",
                    draw && isActive && "tab-active",
                    !draw && "pointer-events-none opacity-40",
                  )
                }
                key={route.path}
                to={`/admin/draws/${year}/${route.path}`}
              >
                {route.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {draw ? (
          <Outlet />
        ) : (
          <Form method="post">
            <div className="container hero bg-base-200 p-8">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <h1 className="text-2xl font-bold">
                    L’édition n’existe pas encore...
                  </h1>
                  <p className="py-6 text-lg opacity-70">
                    Tu dois d’abord la créer avant de pouvoir ajouter des
                    participants et lancer le tirage.
                  </p>
                  <button className="btn btn-secondary" type="submit">
                    {navigation.state === "submitting" ? (
                      <span className="loading loading-spinner" />
                    ) : (
                      `Créer l’édition ${year}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
