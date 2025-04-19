import { Account, auth } from "$modules/auth";
import { org } from "$modules/org";
import { product } from "$modules/product";
import { subscription } from "$modules/subscription";
import { context } from "$modules/ctx";
import { rms } from "$lib/rms";
import { hashPassword } from "@/utils/password";

export const api = rms({
  modules: [
    context(),
    auth(),
    org(),
    product(),
    subscription(),
  ],
  getUser: async event => event.locals.user,
});

Account.hash = password => hashPassword(password);
