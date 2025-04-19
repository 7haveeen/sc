import { route } from "@/ROUTES";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

import { businessInfoSchema } from "./dto/business-reg-schema";
import { shopProfileSchema } from "./dto/schema";
import { remult } from "remult";
import { businessRepo, hasBusinessPerm, shopRepo } from "$modules/org";
import { try_ } from "$lib/utils";

const shopProfileValidator = zod(shopProfileSchema);
const businessInfoValidator = zod(businessInfoSchema);

export const load = (async ({ url }) => {
  if (!remult.user)
    throw redirect(303, route("/signin"));
  if (!remult.user?.activeShopId)
    throw redirect(303, route("/"));
  const [shop, err] = await try_(() =>
    shopRepo.findOne({
      where: {
        publicId: remult.user?.activeShopId,
      },
      include: {
        subscription: { include: { tier: true } },
        ...(hasBusinessPerm.read() ? { business: true } : {}),
      },
    }),
  );

  if (err) {
    throw redirect(302, route("/"));
  }

  const currentTab = url.searchParams.get("tab");

  const shopProfileForm = await superValidate({ ...shop }, shopProfileValidator);
  const businessInfoForm = await superValidate(
    {
      businessType: shop?.business?.type?.toLowerCase() === "corporate" ? "corporate" : "individual",
      businessName: shop?.business?.name ?? "",
      generalLocation: shop?.business?.address ?? "",
      ownerInfo: {
        firstName: shop?.business?.owner?.name?.split(" ")[0] ?? "",
        lastName: shop?.business?.owner?.name?.split(" ").slice(-1)[0] ?? "",
        middleName: shop?.business?.owner?.name?.split(" ").slice(1, -1).join(" ") || undefined,
        residentialAddress: shop?.business?.address ?? "",
      },
      idDocument: {
        type: "identity_card",
        file: null,
      },
      registeredName: shop?.business?.name,
      registeredAddress: shop?.business?.address,
      registrationNumber: undefined,
      registrationDocs: null,
    },
    businessInfoValidator,
    { errors: false },
  );

  return {
    shopProfileForm,
    businessInfoForm,
    shop,
    currentTab,
  };
}) satisfies PageServerLoad;

export const actions = {
  updateShopProfile: async ({ request }) => {
    const activeShopId = remult.user?.activeShopId;
    const form = await superValidate(request, shopProfileValidator);

    if (!activeShopId) {
      throw redirect(303, route("/signin"));
    }

    if (!form.valid) {
      return fail(400, { form });
    }

    const [, err] = await try_(() =>
      shopRepo.updateMany({
        where: {
          publicId: activeShopId,
        },
        set: {
          name: form.data.name,
          email: form.data.email ?? "",
          phone: form.data.phone ?? "",
          address: form.data.address ?? "",
          description: form.data.description ?? "",
        },
      }),
    );

    if (err) {
      if (err.message.includes("Name:")) {
        setError(form, "name", "Shop name already registered");
        return fail(400, {
          form,
        });
      }
      return fail(400, {
        form,
        message: "Failed to update shop profile",
      });
    }

    return { form };
  },

  updateBusinessInfo: async ({ request }) => {
    const activeShopId = remult.user?.activeShopId;
    const form = await superValidate(request, businessInfoValidator);

    if (!activeShopId) {
      throw redirect(303, route("/signin"));
    }

    if (!form.valid) {
      return fail(400, { form });
    }

    const [, err] = await try_(() =>
      businessRepo.updateMany({
        where: {
          publicId: activeShopId,
        },
        set: {
        },
      }),
    );

    if (err) {
      return fail(400, {
        form,
        message: "Failed to update business registration",
      });
    }

    return { form };
  },
} satisfies Actions;
