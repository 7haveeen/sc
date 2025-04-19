import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { onboardingSchema } from "./dto/schema";

export async function load() {
  const form = await superValidate(zod(onboardingSchema));

  return { form };
}
