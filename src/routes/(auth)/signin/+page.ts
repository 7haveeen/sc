import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import {
  forgotPasswordSchema,
  otpSchema,
  passkeySignInSchema,
  passwordSignInSchema,
} from "./schema";
import { remult } from "remult";
import { route } from "@/ROUTES";

export const load: PageLoad = async () => {
  if (remult.user) {
    throw redirect(303, route("/"));
  }

  const userId = remult.user;

  return {
    passkeyForm: await superValidate(valibot(passkeySignInSchema)),
    passwordForm: await superValidate(valibot(passwordSignInSchema)),
    otpForm: await superValidate(valibot(otpSchema)),
    forgotPasswordForm: await superValidate(valibot(forgotPasswordSchema)),
    userId,
  };
};
