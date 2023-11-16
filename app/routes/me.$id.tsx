import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLocation } from "@remix-run/react";
import clsx from "clsx";
import invariant from "tiny-invariant";

import Logo from "~/components/logo";
import { getCurrentDraw } from "~/models/draw.server";
import { getPerson } from "~/models/person.server";
import { genderize } from "~/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  invariant(id, "No ID provided");

  const person = await getPerson(id);

  if (!person) {
    throw new Response(null, {
      status: 404,
      statusText: "On ne se connaît pas je pense",
    });
  }

  const draw = await getCurrentDraw();

  invariant(draw, "Draw not found");

  const isRegistered = Boolean(
    draw.players.find((player) => player.personId === person.id),
  );

  if (!isRegistered) {
    throw new Response(null, {
      status: 404,
      statusText: `Tu n’es pas encore ${genderize("inscrit", person.gender)}`,
    });
  }

  return json({});
};

export default function Me() {
  const location = useLocation();

  return (
    <div
      className={clsx(
        "mx-auto flex h-screen max-w-[1400px] flex-col gap-8 overflow-hidden pb-4 pt-8 md:gap-12 md:py-12",
        !location.pathname.endsWith("/edit") && "overflow-y-hidden",
      )}
    >
      <Logo className="h-[15vw] shrink-0 md:top-12 md:h-28" />
      <Outlet />
    </div>
  );
}
