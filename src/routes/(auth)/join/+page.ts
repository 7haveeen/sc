import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { email, passkey, password, verification } from "./schema";
import { sellerRegistration as regStore } from "@/stores/seller";
import { redirect } from "@sveltejs/kit";
import { encodeText } from "$lib/utils/helpers";

import type { PageLoad } from "./$types";

export const load = (async ({ url }) => {
  const regState = regStore.state;
  const currentStep = url.searchParams.get("step") || "email";

  const redirectPath = await regStore.ensureStepIntegrity(currentStep);

  if (redirectPath) {
    throw redirect(302, redirectPath);
  }

  const credentialUserId = encodeText(regState.userId, 8);

  const joinForm = await superValidate(valibot(email));
  const passkeyForm = await superValidate(valibot(passkey));
  const passwordForm = await superValidate(valibot(password));
  const verifyForm = await superValidate(valibot(verification));

  return {
    joinForm,
    verifyForm,
    passkeyForm,
    passwordForm,
    credentialUserId,
    regState,
    currentStep,
  };
}) satisfies PageLoad;
