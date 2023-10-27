import { redirect } from "@remix-run/node";

import { getCurrentYear } from "~/utils";

export const loader = async () => {
  const year = getCurrentYear();
  return redirect(`/admin/draws/${year}`);
};
