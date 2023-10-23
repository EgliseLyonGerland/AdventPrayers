import { redirect } from "@remix-run/node";

export const loader = async () => {
  const year = new Date().getFullYear();
  return redirect(`/draws/${year}`);
};
