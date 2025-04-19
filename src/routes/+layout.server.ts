import { remult } from "remult";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = (async () => {
  const user = remult.user;
  return {
    user,
  };
}) satisfies LayoutServerLoad;
