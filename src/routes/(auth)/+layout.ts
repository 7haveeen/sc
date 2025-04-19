import { remult } from "remult";
import type { LayoutLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { route } from "@/ROUTES";

export const load = (async () => {
  if (remult.user)
    throw redirect(303, route("/"));
}) satisfies LayoutLoad;
