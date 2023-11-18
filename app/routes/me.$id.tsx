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
      statusText: `Tu n’es pas encore ${genderize("inscrit", person)}`,
    });
  }

  return json({});
};

export default function Me() {
  const location = useLocation();

  return (
    <div
      className={clsx(
        "mx-auto flex min-h-[100svh] flex-col pb-4 md:pb-12",
        location.pathname.endsWith("/edit") && "h-[100svh] overflow-hidden",
      )}
    >
      <div className="pointer-events-none sticky top-0 z-10 bg-gradient-to-b from-base-200">
        <Logo className="mx-auto my-8 h-[15vw] shrink-0 md:my-12 md:h-28" />
      </div>
      <Outlet />
    </div>
  );
}
