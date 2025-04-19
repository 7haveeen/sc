import { route } from "@/ROUTES";
import { redirect } from "@sveltejs/kit";
import { remult } from "remult";
import { hasRole } from "@/services/iam/auth/permission";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  if (!remult.user)
    throw redirect(303, route("/signin"));
  if (hasRole("pending_seller"))
    throw redirect(303, route("/onboarding"));
  /* if (!hasShopPerm.read())
    throw redirect(303, route("/access-denied")); */
};
