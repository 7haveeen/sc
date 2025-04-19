import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load = (async ({ url }) => {
  if (url.pathname === "/settings") {
    throw redirect(303, "/settings/shop?tab=overview");
  }
}) satisfies LayoutServerLoad;
