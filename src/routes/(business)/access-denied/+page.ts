import { route } from "@/ROUTES";
import { hasRole } from "@/services/iam";
import { redirect } from "@sveltejs/kit";
import { hasShopPerm } from "$modules/org";

import type { PageLoad } from "./$types";

export const load = (async () => {
  if (hasShopPerm.create())
    throw redirect(303, route("/"));
  if (hasRole("pending_seller"))
    throw redirect(303, route("/onboarding"));
}) satisfies PageLoad;
