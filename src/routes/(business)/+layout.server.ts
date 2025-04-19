import { route } from "@/ROUTES";
import { remult } from "remult";
import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load = (async () => {
  const user = remult.user;
  if (!user)
    throw redirect(303, route("/signin"));
}) satisfies LayoutServerLoad;
