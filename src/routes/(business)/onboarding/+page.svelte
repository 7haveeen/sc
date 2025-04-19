<script lang="ts">
  import { InputPhone } from "@/components/custom/input-phone";
  import { route } from "@/ROUTES";
  import { goto } from "$app/navigation";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Popover from "$lib/components/ui/popover";
  import { RadioGroup } from "bits-ui";
  import Building2 from "lucide-svelte/icons/building-2";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import InfoIcon from "lucide-svelte/icons/info";
  import MapPin from "lucide-svelte/icons/map-pin";
  import Phone from "lucide-svelte/icons/phone";
  import Store from "lucide-svelte/icons/store";
  import Users from "lucide-svelte/icons/users";
  import { toast } from "svelte-sonner";
  import { setError, superForm } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";

  import { onboardingSchema } from "./dto/schema";
  import { BusinessService } from "$modules/org";

  const { data } = $props();

  type BusinessType = {
    id: "individual" | "corporate";
    name: string;
    description: string;
    icon: any;
  };

  const businessTypes: BusinessType[] = [
    {
      id: "individual",
      name: "Individual Account",
      description: "Perfect for individual sellers",
      icon: Users,
    },
    {
      id: "corporate",
      name: "Corporate Account",
      description: "Perfect for registered companies",
      icon: Building2,
    },
  ];

  const sf_onboardingForm = superForm(data.form, {
    resetForm: false,
    SPA: true,
    validators: zod(onboardingSchema),
    onUpdate: async ({ form: f }) => {
      if (f.valid) {
        const res = await BusinessService.create({
          name: f.data.businessName,
          phone: f.data.phone,
          address: f.data.address,
          type: f.data.businessType,
        });

        if (!res.success) {
          if (res.message?.includes("Name:")) {
            setError(f, "businessName", "Business name already exists");
          }
          else {
            if (res.message) {
              toast.error("Error", {
                description: res.message,
              });
            }
            else {
              toast.error("Something went wrong", {
                description: "Please try again later...",
              });
            }
          }
        }
      }
    },
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        goto(route("/"), {
          replaceState: true,
        });
      }
    },
    onError: () => {
      toast.error("Connection Lost", {
        description: "Please try again...",
      });
    },
  });

  const {
    form: onboardingForm,
    enhance: onboardingEnhance,
    submitting: onboardingSubmitting,
  } = sf_onboardingForm;
</script>

<div class="mx-auto flex flex-col pt-6 md:pt-0 lg:grid-cols-2">
  <div class="p-4 lg:p-10">
    <div class="mx-auto flex w-full max-w-lg flex-col space-y-8">
      <form method="POST" use:onboardingEnhance class="space-y-6">
        <div class="space-y-8">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-semibold">Choose Account Type</span>
              <Popover.Root>
                <Popover.Trigger class="focus:outline-none">
                  <InfoIcon class="text-muted-foreground size-3.5" />
                </Popover.Trigger>
                <Popover.Content side="right" align="start" sideOffset={8} class="text-xs">
                  <div class="space-y-2">
                    <div>
                      <h4 class="font-medium">Account Types</h4>
                      <p class="text-muted-foreground text-[0.6rem]">
                        Choose the account type that best matches your business structure and needs.
                      </p>
                    </div>
                    <div class="relative grid grid-cols-2 gap-2">
                      <div class="absolute inset-0">
                        <div
                          class="border-border/40 absolute left-1/2 h-full w-[1px] -translate-x-1/2 border-r"
                        ></div>
                        <div
                          class="border-border/40 absolute top-1/2 w-full -translate-y-1/2 border-t"
                        ></div>
                      </div>

                      <div class="relative space-y-1 p-2 text-center">
                        <span class="text-[0.7rem] font-medium">Individual Account</span>
                        <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                          Perfect for solo entrepreneurs and small businesses.
                        </p>
                      </div>
                      <div class="relative space-y-1 p-2 text-center">
                        <span class="text-[0.7rem] font-medium">Corporate Account</span>
                        <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                          Ideal for registered companies and larger organizations.
                        </p>
                      </div>
                      <div class="relative space-y-1 p-2 text-center">
                        <span class="text-[0.7rem] font-medium">Upgrades</span>
                        <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                          Can be upgraded anytime as your business grows.
                        </p>
                      </div>
                      <div class="relative space-y-1 p-2 text-center">
                        <span class="text-[0.7rem] font-medium">Features</span>
                        <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                          Advanced business tools and analytics.
                        </p>
                      </div>
                    </div>
                    <div class="border-border/50 rounded-sm border border-dashed p-1.5">
                      <p class="text-muted-foreground text-center text-[0.6rem]">
                        Your account type can be changed later through business verification.
                      </p>
                    </div>
                  </div>
                </Popover.Content>
              </Popover.Root>
            </div>
            <p class="text-muted-foreground text-xs">
              Select the type of account that best suits your business needs
            </p>
          </div>
          <RadioGroup.Root
            bind:value={$onboardingForm.businessType}
            class="grid gap-4 md:grid-cols-2"
          >
            {#each businessTypes as type}
              <div class="relative h-full">
                <RadioGroup.Item value={type.id} id={type.id} class="absolute left-1.5 top-1.5">
                  {#snippet children({ checked })}
                    {#if checked}
                      <CircleCheck class="text-brand size-4" />
                    {/if}
                  {/snippet}
                </RadioGroup.Item>
                <Label for={type.id} class="h-full cursor-pointer">
                  <div
                    class="h-full rounded-lg border border-dashed p-3 transition-colors {$onboardingForm.businessType
                      === type.id
                      ? "border-border bg-border/50"
                      : "border-border"}"
                  >
                    <div class="flex h-full items-center gap-3">
                      <div class="flex size-12 shrink-0 items-center justify-center rounded-lg">
                        <type.icon
                          class="size-6 {$onboardingForm.businessType === type.id
                            ? "text-primary"
                            : "text-muted-foreground"}"
                        />
                      </div>
                      <div class="space-y-1">
                        <h3 class="text-base font-bold">{type.name}</h3>
                        <p class="text-muted-foreground text-xs">{type.description}</p>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            {/each}
          </RadioGroup.Root>

          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold">Business Information</span>
                <Popover.Root>
                  <Popover.Trigger class="focus:outline-none">
                    <InfoIcon class="text-muted-foreground size-3.5" />
                  </Popover.Trigger>
                  <Popover.Content side="right" align="start" sideOffset={8} class="text-xs">
                    <div class="space-y-2">
                      <div>
                        <h4 class="font-medium">Business Information</h4>
                        <p class="text-muted-foreground text-[0.6rem]">
                          This information helps us customize your business profile and improve your
                          experience.
                        </p>
                      </div>
                      <div class="relative grid grid-cols-2 gap-2">
                        <div class="absolute inset-0">
                          <div
                            class="border-border/40 absolute left-1/2 h-full w-[1px] -translate-x-1/2 border-r"
                          ></div>
                          <div
                            class="border-border/40 absolute top-1/2 w-full -translate-y-1/2 border-t"
                          ></div>
                        </div>
                        <div class="relative space-y-1 p-2 text-center">
                          <span class="text-[0.7rem] font-medium">Business Name</span>
                          <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                            Your business name will be displayed to customers.
                          </p>
                        </div>
                        <div class="relative space-y-1 p-2 text-center">
                          <span class="text-[0.7rem] font-medium">Contact Details</span>
                          <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                            Used for notifications and support.
                          </p>
                        </div>
                        <div class="relative space-y-1 p-2 text-center">
                          <span class="text-[0.7rem] font-medium">Address</span>
                          <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                            Required for business verification.
                          </p>
                        </div>
                        <div class="relative space-y-1 p-2 text-center">
                          <span class="text-[0.7rem] font-medium">Account Type</span>
                          <p class="text-muted-foreground text-[0.6rem] leading-relaxed">
                            Determines your business features.
                          </p>
                        </div>
                      </div>
                      <div class="border-border/50 rounded-sm border border-dashed p-1.5">
                        <p class="text-muted-foreground text-center text-[0.6rem]">
                          All information can be updated later in your account settings.
                        </p>
                      </div>
                    </div>
                  </Popover.Content>
                </Popover.Root>
              </div>

              <p class="text-muted-foreground text-xs">
                Please provide your business details to help us customize your experience.
              </p>
            </div>

            <Form.Field form={sf_onboardingForm} name="businessName" class="mb-6">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label class="sr-only">Business Name</Form.Label>
                  <div class="relative">
                    <Store
                      class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                    />
                    <Input
                      {...props}
                      bind:value={$onboardingForm.businessName}
                      placeholder="Your Business Name"
                      class="h-11 pl-10 text-base"
                      autocomplete="off"
                      spellcheck="false"
                    />
                  </div>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors class="text-[0.7rem]" />
            </Form.Field>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Field form={sf_onboardingForm} name="phone">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label class="sr-only">Phone Number</Form.Label>
                    <div class="relative">
                      <Phone
                        class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                      />
                      <InputPhone
                        {...props}
                        bind:value={$onboardingForm.phone}
                        placeholder="+263 7XX XXX XXX"
                        class="h-11 pl-10"
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors class="text-[0.7rem]" />
              </Form.Field>

              <Form.Field form={sf_onboardingForm} name="address">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label class="sr-only">Business Address</Form.Label>
                    <div class="relative">
                      <MapPin
                        class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                      />
                      <Input
                        {...props}
                        bind:value={$onboardingForm.address}
                        placeholder="Business Address"
                        class="h-11 pl-10 text-base"
                        autocomplete="address-line1"
                        spellcheck="false"
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors class="text-[0.7rem]" />
              </Form.Field>
            </div>
          </div>
        </div>

        <Form.Button class="h-11 w-full" disabled={$onboardingSubmitting}>
          {#if $onboardingSubmitting}
            <p class="loading-dots">Setting up your store</p>
          {:else}
            Submit
          {/if}
        </Form.Button>
      </form>
    </div>
  </div>
</div>

<style>
  .loading-dots::after {
    content: "";
    animation: dots 1.5s infinite;
  }

  @keyframes dots {
    0%,
    20% {
      content: "";
    }
    40% {
      content: ".";
    }
    60% {
      content: "..";
    }
    80%,
    100% {
      content: "...";
    }
  }
</style>
