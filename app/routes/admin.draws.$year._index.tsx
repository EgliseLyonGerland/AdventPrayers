import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { getYearParam } from "~/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  return redirect(`/admin/draws/${year}/players`);
};
