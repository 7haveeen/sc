<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import { Card } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import FingerprintIcon from "lucide-svelte/icons/fingerprint";
  import ShieldCheckIcon from "lucide-svelte/icons/shield-check";
  import EyeIcon from "lucide-svelte/icons/eye";
  import EyeOffIcon from "lucide-svelte/icons/eye-off";
  import LockIcon from "lucide-svelte/icons/lock";
  import Password from "phosphor-svelte/lib/Password";
  import { calculatePasswordStrength, passkey, password } from "../schema";
  import { valibotClient } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms";
  import { cn } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { route } from "@/ROUTES";
  import { createPasskeyCredential } from "@/services/iam";
  import { authType } from "../../signin/+page.svelte";
  import type { AuthType } from "../../signin/+page.svelte";
  import { sellerRegistration as regStore } from "@/stores/seller";

  import type { PageData } from "../$types";

  let { data }: { data: PageData } = $props();

  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let authMethod = $state<AuthType>(authType.passkey);

  const setAuthMethod = (value: AuthType) => (authMethod = value);

  const passkeyForm = superForm(data.passkeyForm || {
    name: "",
    attestation_object: "",
    client_data_json: "",
    device_type: "",
    transports: "",
  }, {
    validators: valibotClient(passkey),
    dataType: "json",
    SPA: true,
    onSubmit: async () => {
      if (authMethod === authType.passkey) {
        const registrationState = regStore.state;

        if (!registrationState.userId || !registrationState.emailVerified) {
          await goto(route("/join") + "?step=email", {
            replaceState: true,
          });
          return;
        }

        // Add null checks for userId and email
        const userId = regStore.state.userId;
        const email = regStore.state.email;

        if (!userId || !email) {
          toast.error("Registration error", {
            description: "Missing user information. Please start over.",
          });
          await goto(route("/join") + "?step=email", { replaceState: true });
          return;
        }

        const result = await createPasskeyCredential({
          user: {
            userId,
            email,
          },
          credentialUserId: data.credentialUserId,
        });

        if (result.error) {
          if (result.error?.includes("timed out")) {
            toast.error("Authentication Failed", {
              description: "User rejected or timed out",
            });
          }
          else {
            toast.error("Failed to Create Passkey", {
              description: result.error,
            });
          }
        }
      }
    },
    onUpdate: ({ form, result }) => {
      if (!form.valid) {
        toast.error("Form validation failed", {
          description: "Please check your inputs",
        });
        return;
      }

      if (form.valid && result.type === "failure" && result.data.error) {
        toast.error("Failed to Create Account", {
          description: "Contact Support...",
        });
      }
    },
    onUpdated: async ({ form }) => {
      if (form.valid) {
        // Mark registration as complete in our store
        regStore.setComplete();

        toast.success("Account Created Successfully", {
          description: "SignIn now...",
        });
        await goto(route("/signin"), {
          replaceState: true,
        });
      }
    },
    onError: () => {
      toast.error("Internal server error", {
        description: "Please try again later...",
      });
    },
  });

  const passwordForm = superForm(data.passwordForm, {
    validators: valibotClient(password),
    dataType: "json",
    SPA: true,
    onSubmit: async () => {
      if (authMethod === authType.password) {
        const regState = regStore.state;

        if (!regState.userId || !regState.emailVerified) {
          toast.error("Registration error", {
            description: "Please complete previous steps first",
          });
          await goto(route("/join") + "?step=email", { replaceState: true });
        }
      }
    },
    onUpdate: async ({ form: f }) => {
      if (!f.valid)
        return;

      const success = await regStore.completeRegistration(f.data.password);

      if (!success) {
        toast.error("Failed to create account", {
          description: "Please try again later.",
        });
        return;
      }

      regStore.setComplete();

      toast.success("Account Created Successfully", {
        description: "SignIn now...",
      });
    },
    onError: () => {
      toast.error("Connection Lost", {
        description: "Please try again...",
      });
    },
  });

  const {
    enhance: passkeyFormEnhance,
    submitting: passkeyFormSubmitting,
  } = passkeyForm;

  const {
    form: passwordFormData,
    enhance: passwordFormEnhance,
    submitting: passwordFormSubmitting,
  } = passwordForm;

  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, text: "At least 8 characters" },
    { test: (p: string) => /[A-Z]/.test(p), text: "One uppercase letter" },
    { test: (p: string) => /[a-z]/.test(p), text: "One lowercase letter" },
    { test: (p: string) => /\d/.test(p), text: "One number" },
    { test: (p: string) => /[^A-Z0-9]/i.test(p), text: "One special character" },
  ];

  const meetsAllRequirements = $derived(
    $passwordFormData.password
      ? passwordRequirements.every(req => req.test($passwordFormData.password))
      : false,
  );

  const passwordStrength = $derived(
    $passwordFormData.password ? calculatePasswordStrength($passwordFormData.password) : 0,
  );

  const getStrengthIndicator = (strength: number) => {
    if (!meetsAllRequirements) {
      return {
        color: strength < 30 ? "" : "#eab308",
        text: strength < 30 ? "Weak" : "Medium",
      };
    }
    return { color: "#22c55e", text: "Strong" };
  };
</script>

<div class="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
  <div class="flex flex-col space-y-2 text-center">
    <h1 class="text-2xl font-semibold tracking-tight">Secure your account</h1>
    <p class="text-muted-foreground text-sm">Choose how you want to secure your account</p>
  </div>

  <div class="w-full space-y-4">
    <!-- Passkey Option -->
    <form
      id="passkey_signup_form"
      method="POST"
      class="space-y-4"
      use:passkeyFormEnhance
    >
      <div
        role="button"
        tabindex="0"
        onclick={() => setAuthMethod(authType.passkey)}
        onkeydown={e => e.key === "Enter" && setAuthMethod(authType.passkey)}
      >
        <Card
          class="overflow-y-clip shadow-sm [interpolate-size:allow-keywords] [transition:height_1s] {authMethod === authType.passkey
            ? "ring-primary h-auto ring-2"
            : "h-[60px]"}"
        >
          <div
            class={authMethod === authType.passkey
              ? "h-auto p-4"
              : "flex h-[60px] items-center px-4"}
          >
            <div class="flex w-full items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="bg-primary/10 flex items-center justify-center rounded-full p-2">
                  <FingerprintIcon class="text-primary size-5" />
                </div>
                <span class="text-base font-semibold">
                  {authMethod === authType.passkey ? "Passkey (Recommended)" : "Use Passkey"}
                </span>
              </div>
              <Badge
                class="bg-brand gap-1 px-1.5 text-[0.6rem] text-white shadow-none pointer-events-none h-6 cursor-default"
              >
                <ShieldCheckIcon class="size-3" />
                Face ID/Touch ID
              </Badge>
            </div>

            {#if authMethod === authType.passkey}
              <p class="text-muted-foreground mt-1 text-pretty text-xs">
                Passkeys offer the strongest account security. To access your account, you use
                Face ID, Touch ID, or Passcode.
              </p>
            {/if}
          </div>
        </Card>
      </div>
    </form>

    <!-- Password Option -->
    <form
      id="password_signup_form"
      method="POST"
      class="space-y-4"
      use:passwordFormEnhance
    >
      <div
        role="button"
        tabindex="0"
        onclick={() => setAuthMethod(authType.password)}
        onkeydown={e => e.key === "Enter" && setAuthMethod(authType.password)}
      >
        <Card
          class="relative overflow-y-clip shadow-sm [interpolate-size:allow-keywords] [transition:height_1s] {authMethod
            === authType.password
            ? "ring-primary h-auto ring-2"
            : "h-[60px]"}"
        >
          <div
            class={authMethod === authType.password
              ? "h-auto p-4"
              : "flex h-[60px] items-center px-4"}
          >
            <div class="flex items-center gap-3 opacity-70">
              <Password class="size-6" weight="bold" />
              <span class="text-base font-medium">
                {authMethod === authType.password ? "Password" : "Use Password Instead"}
              </span>
            </div>

            {#if authMethod === authType.password}
              <div class="mt-4 flex flex-col gap-2">
                <div class="space-y-4">
                  <Form.Field form={passwordForm} name="password" class="space-y-1">
                    <Form.Control>
                      {#snippet children({ props })}
                        <div class="relative">
                          <LockIcon
                            class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                          />
                          <Input
                            {...props}
                            type={showPassword ? "text" : "password"}
                            bind:value={$passwordFormData.password}
                            class="h-11 pl-10 pr-10 text-base"
                            placeholder="Password"
                            autocomplete="new-password"
                          />
                          <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2"
                            onclick={() => (showPassword = !showPassword)}
                          >
                            {#if showPassword}
                              <EyeOffIcon class="text-muted-foreground size-5" />
                            {:else}
                              <EyeIcon class="text-muted-foreground size-5" />
                            {/if}
                          </button>
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>

                  <Form.Field form={passwordForm} name="confirmPassword" class="space-y-1">
                    <Form.Control>
                      {#snippet children({ props })}
                        <div class="relative">
                          <LockIcon
                            class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                          />
                          <Input
                            {...props}
                            type={showConfirmPassword ? "text" : "password"}
                            bind:value={$passwordFormData.confirmPassword}
                            class="h-11 pl-10 pr-10 text-base"
                            placeholder="Confirm Password"
                            autocomplete="new-password"
                          />
                          <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2"
                            onclick={() => (showConfirmPassword = !showConfirmPassword)}
                          >
                            {#if showConfirmPassword}
                              <EyeOffIcon class="text-muted-foreground size-5" />
                            {:else}
                              <EyeIcon class="text-muted-foreground size-5" />
                            {/if}
                          </button>
                        </div>

                      {/snippet}
                    </Form.Control>
                    <Form.FieldErrors class="text-[0.7rem]" />
                    {#if $passwordFormData.password}
                      <div class="pt-3 flex items-center gap-2">
                        <div class="flex flex-1 gap-1">
                          {#each Array.from({ length: 5 }) as _, i}
                            <span
                              class={cn(
                                "h-[3px] flex-1 rounded-sm transition-all duration-300",
                                passwordStrength >= (i + 1) * 20
                                  ? !meetsAllRequirements
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-muted",
                              )}
                            ></span>
                          {/each}
                        </div>
                        {#if $passwordFormData.password}
                          {@const strength = getStrengthIndicator(passwordStrength)}
                          <span
                            class="flex w-12 justify-end text-xs font-medium opacity-80 transition-colors duration-300"
                            style={"color: " + strength.color}
                          >
                            {strength.text}
                          </span>
                        {/if}
                      </div>
                    {/if}
                  </Form.Field>
                </div>
              </div>
            {/if}
          </div>
        </Card>
      </div>
    </form>

    <div class="space-y-4">
      <Form.Button
        class="h-12 w-full font-semibold rounded-lg"
        disabled={$passwordFormSubmitting || $passkeyFormSubmitting}
        form={authMethod === authType.passkey ? "passkey_signup_form" : "password_signup_form"}
      >
        {#if $passwordFormSubmitting || $passkeyFormSubmitting}
          <p class="loading-dots">Signing Up</p>
        {:else}
          {authMethod === authType.passkey ? "Continue with Passkey" : "Create Account"}
        {/if}
      </Form.Button>
    </div>
  </div>

  <p class="text-muted-foreground/80 px-8 text-center text-xs">
    By continuing, you agree to our
    <a href={route("/")} class="hover:text-primary underline underline-offset-4">Terms of Service</a>
    and
    <a href={route("/")} class="hover:text-primary underline underline-offset-4">Privacy Policy</a>.
  </p>
</div>

<style>
  .loading-dots::after {
    content: '';
    animation: dots 1.5s infinite;
  }

  @keyframes dots {
    0%,
    20% {
      content: '';
    }
    40% {
      content: '.';
    }
    60% {
      content: '..';
    }
    80%,
    100% {
      content: '...';
    }
  }
</style>
