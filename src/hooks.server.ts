import { sequence } from "@sveltejs/kit/hooks";
import { api as handleRemult } from "@/api";

export const handle = sequence(handleRemult);
