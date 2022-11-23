import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { getYearParam } from "~/utils";

export const loader: LoaderFunction = async ({ params }) => {
  const year = getYearParam(params);
  return redirect(`/draws/${year}/players`);
};
