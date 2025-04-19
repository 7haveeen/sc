import { remult } from "remult";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async (event) => {
  remult.user = event.data.user;
  remult.useFetch(event.fetch);
  return { ...event.data };
};
