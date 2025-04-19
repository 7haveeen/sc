<script lang="ts" module>
  export const authState = {
    credentials: "/signin",
    twoFactor: "/_2fa",
    forgotPassword: "/forgot_password",
  } as const;

  export const authType = {
    passkey: "passkey",
    password: "password",
  } as const;

  export type AuthState = (typeof authState)[keyof typeof authState];
  export type AuthType = (typeof authType)[keyof typeof authType];
</script>

<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import { Card } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    forgotPasswordSchema,
    otpSchema,
    passkeySignInSchema,
    passwordSignInSchema,
  } from "./schema";
  import { valibotClient } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms";
  import { toast } from "svelte-sonner";
  import { BrandIcon } from "$lib/components/icons/logo";
  import AtSign from "lucide-svelte/icons/at-sign";
  import EyeIcon from "lucide-svelte/icons/eye";
  import EyeOffIcon from "lucide-svelte/icons/eye-off";
  import FingerprintIcon from "lucide-svelte/icons/fingerprint";
  import LockIcon from "lucide-svelte/icons/lock";
  import Quote from "lucide-svelte/icons/quote";
  import Password from "phosphor-svelte/lib/Password";
  import { goto } from "$app/navigation";
  import * as InputOTP from "$lib/components/ui/input-otp";
  import { page } from "$app/state";
  import { Countdown } from "$lib/components/app/countdown";
  import { route } from "$lib/ROUTES";
  import { resendCode } from "@/components/app/countdown/countdown.svelte";
  import ShieldCheckIcon from "lucide-svelte/icons/shield-check";
  import { try_ } from "@/utils";
  import { createPasskeySignInCredential } from "@/services/iam";
  import { OtpType } from "$modules/auth";

  let { data } = $props();

  let showPassword = $state(false);
  let authMethod = $state<AuthType>(authType.passkey);
  let userId = $state<string | undefined>(data.userId);
  let user = $state(data.user);
  let countdownRef = $state<{ startCountdown: () => void } | undefined>(undefined);

  let params = $derived(page.url.searchParams);
  let currentState = $derived<AuthState>(
    params.has(authState.twoFactor)
      ? authState.twoFactor
      : params.has(authState.forgotPassword)
      ? authState.forgotPassword
      : authState.credentials,
  );

  const setAuthMethod = (value: AuthType) => (authMethod = value);

  const passkeyForm = superForm(data.passkeyForm, {
    validators: valibotClient(passkeySignInSchema),
    onSubmit: async () => {
      if (authMethod === authType.passkey) {
        const [res, err] = await try_(() => createPasskeySignInCredential());

        if (err || res?.error) {
          if (res?.error?.includes("timed out")) {
            toast.error("Authentication Failed", {
              description: "User rejected or timed out",
            });
          }

          toast.error("Authentication Failed", {
            description: res?.error || "Please try again later",
          });
        }
      }
    },
    onUpdate: async ({ form: f, result, cancel }) => {
      if (f.valid && result.data?.error) {
        toast.error("Authentication Failed", {
          description: result.data.error,
        });
        passkeyForm.reset();
        cancel();
      }
    },
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        toast.success("Signed In Successfully", {
          description: "You are now being redirected...",
        });
        await goto(route("/"), {
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

  const passwordForm = superForm(data.passwordForm, {
    validators: valibotClient(passwordSignInSchema),
    onUpdate: async ({ form: f, result, cancel }) => {
      if (f.valid) {
        if (result.type === "failure") {
          toast.error(result.data?.error ?? "Sign in failed");
          cancel();
          return;
        }
        if (!result.data.userId) {
          toast.error("Sign in failed");
          cancel();
          return;
        }

        userId = result.data.userId;
      }
    },
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        countdownRef?.startCountdown();
      }
    },
    onError: () => {
      toast.error("Connection Lost", {
        description: "Please try again...",
      });
    },
  });

  const otpForm = superForm(data.otpForm, {
    validators: valibotClient(otpSchema),
    validationMethod: "onsubmit",
    onUpdate: async ({ form: f, result, cancel }) => {
      if (f.valid) {
        if (result.type === "failure") {
          toast.error(result.data?.error ?? "Failed to authenticate");
          cancel();
        }
      }
    },
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        toast.success("Signed In Successfully", {
          description: "You are now being redirected...",
        });
        await goto(route("/"), {
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

  const forgotPasswordForm = superForm(data.forgotPasswordForm, {
    validators: valibotClient(forgotPasswordSchema),
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        toast.error("Password Reset Sent", {
          description: "Please check your email...",
        });
        await goto(route("/signin"), {
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
    form: signInFormData,
    enhance: signInFormEnhance,
    submitting: signInFormSubmitting,
  } = passwordForm;

  const { form: otpFormData, enhance: otpFormEnhance, submitting: otpFormSubmitting } = otpForm;

  const {
    form: forgotPasswordFormData,
    enhance: forgotPasswordFormEnhance,
    submitting: forgotPasswordFormSubmitting,
  } = forgotPasswordForm;

  const { enhance: passkeyFormEnhance } = passkeyForm;
</script>

<div
  class="container relative grid min-h-[100dvh] flex-col items-center justify-center pt-6 lg:max-w-none lg:grid-cols-[45%_55%] lg:justify-center lg:px-0 lg:pt-0"
>
  <div class="bg-secondary relative hidden h-full flex-col border-r p-10 lg:flex">
    <div class="z-20 flex items-center">
      <a href={route("/")}>
        <BrandIcon />
      </a>
    </div>
    <div class="z-20 mt-auto">
      <blockquote class="space-y-4">
        <Quote class="text-muted-foreground/50 size-4" />
        <p class="text-muted-foreground/90 text-sm font-medium leading-relaxed">
          Setting up my store on 7Haven was incredibly smooth. The platform's intuitive onboarding
          process made it easy to get started and begin selling right away.
        </p>
        <footer class="flex items-center gap-2">
          <div class="bg-primary/10 flex size-10 items-center justify-center rounded-full">
            <span class="text-primary text-lg font-semibold">M</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium">Myra</span>
            <span class="text-muted-foreground text-xs">Founder of Urban Essentials</span>
          </div>
        </footer>
      </blockquote>
    </div>
  </div>

  <div class="flex h-full w-full items-start pt-4 lg:items-center lg:p-8">
    {#if currentState === authState.credentials}
      <div
        class="mx-auto flex w-full flex-col justify-start space-y-6 lg:w-[380px] lg:justify-center"
      >
        <div class="flex flex-col space-y-12 text-center lg:space-y-0">
          <div class="flex justify-center lg:hidden">
            <a href={route("/")}>
              <BrandIcon />
            </a>
          </div>
          <div class="flex flex-col text-center">
            <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p class="text-muted-foreground text-sm">SignIn to your seller center</p>
          </div>
        </div>

        <div class="w-full space-y-4">
          <!-- Passkey Option -->
          <form
            id="passkey_signin_form"
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
                        {authMethod === authType.passkey ? "Quick SignIn" : "Use Passkey"}
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
                      Passkeys offer the strongest account security. To access your account, you
                      use Face ID, Touch ID, or Passcode.
                    </p>
                  {/if}
                </div>
              </Card>
            </div>
          </form>

          <!-- Password Option -->
          <form
            id="password_signin_form"
            method="POST"
            class="space-y-4"
            use:signInFormEnhance
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
                      {authMethod === authType.password ? "Sign In" : "Use Password Instead"}
                    </span>
                  </div>

                  {#if authMethod === authType.password}
                    <div class="mt-4 flex flex-col gap-2">
                      <Form.Field form={passwordForm} name="email" class="space-y-1">
                        <Form.Control>
                          {#snippet children({ props })}
                            <div class="relative">
                              <AtSign
                                class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                              />
                              <Input
                                {...props}
                                bind:value={$signInFormData.email}
                                type="email"
                                class="h-11 pl-10 text-base"
                                placeholder="Email address"
                                autocomplete="email"
                              />
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>

                      <Form.Field form={passwordForm} name="password" class="space-y-1">
                        <Form.Control>
                          {#snippet children({ props })}
                            <div class="relative">
                              <LockIcon
                                class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                              />
                              <Input
                                {...props}
                                bind:value={$signInFormData.password}
                                type={showPassword ? "text" : "password"}
                                class="h-11 pl-10 pr-10 text-base"
                                placeholder="Password"
                                autocomplete="current-password"
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
                    </div>
                  {/if}
                </div>
              </Card>
            </div>
          </form>
          <div class="space-y-4">
            <Form.Button
              class="h-12 w-full font-semibold rounded-lg"
              disabled={$signInFormSubmitting}
              form={authMethod === authType.passkey
                ? "passkey_signin_form"
                : "password_signin_form"}
            >
              {#if $signInFormSubmitting}
                <p class="loading-dots">Signing in</p>
              {:else}
                {authMethod === authType.passkey ? "Continue with Passkey" : "Sign In"}
              {/if}
            </Form.Button>

            <div class="flex items-center justify-between text-xs">
              <a
                href={route("/")}
                class="text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </a>
              <a
                href={route("/join")}
                class="text-primary hover:text-primary/90 font-medium transition-colors"
              >
                Create an account
              </a>
            </div>
          </div>
        </div>

        <p class="text-muted-foreground/80 px-8 text-center text-xs">
          By continuing, you agree to our
          <a href={route("/")} class="hover:text-primary underline underline-offset-4"
          >Terms of Service</a
          >
          and
          <a href={route("/")} class="hover:text-primary underline underline-offset-4"
          >Privacy Policy</a
          >.
        </p>
      </div>
    {:else if currentState === authState.twoFactor}
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <div class="flex flex-col items-center space-y-2 text-center">
          <h2 class="text-2xl font-semibold">Two-Factor Authentication</h2>
          <p class="text-muted-foreground text-sm">We've sent a verification code to your email</p>
        </div>

        <!-- OTP Input Form -->
        <form method="POST" action={route("/")} use:otpFormEnhance class="space-y-5">
          <Form.Field
            form={otpForm}
            name="verification_code"
            class="flex w-full flex-col items-center"
          >
            <Form.Control>
              {#snippet children({ props })}
                <InputOTP.Root
                  maxlength={6}
                  {...props}
                  bind:value={$otpFormData.verification_code}
                  spellcheck="false"
                  autocapitalize="off"
                  autocomplete="off"
                  inputmode="text"
                >
                  {#snippet children({ cells })}
                    <InputOTP.Group>
                      {#each cells.slice(0, 3) as cell}
                        <InputOTP.Slot
                          {cell}
                          class="size-12 rounded-md border text-lg font-semibold shadow-sm"
                        />
                      {/each}
                    </InputOTP.Group>
                    <InputOTP.Separator class="text-muted-foreground">-</InputOTP.Separator>
                    <InputOTP.Group>
                      {#each cells.slice(3, 6) as cell}
                        <InputOTP.Slot
                          {cell}
                          class="size-12 rounded-md border text-center text-lg font-semibold shadow-sm"
                        />
                      {/each}
                    </InputOTP.Group>
                  {/snippet}
                </InputOTP.Root>
              {/snippet}
            </Form.Control>
            <div class="min-h-[1rem] text-[0.7rem] font-medium">
              <Form.FieldErrors class="text-[0.7rem]" />
            </div>
            <Form.Description class="text-[0.7rem]">
              Enter the 6-digit code we sent to your email
            </Form.Description>
          </Form.Field>

          <div class="space-y-4">
            <Form.Button class="h-11 w-full font-semibold" disabled={$otpFormSubmitting}>
              {#if $otpFormSubmitting}
                <p class="loading-dots">Verifying</p>
              {:else}
                Verify
              {/if}
            </Form.Button>
            <div class="text-center">
              <Countdown
                bind:this={countdownRef}
                config={{
                  duration: 2 * 60,
                  storageKey: "auth_countdown",
                }}
                label="Resend code"
                onclick={async () => {
                  await resendCode(userId!, user!.email, OtpType.Auth);
                  countdownRef?.startCountdown();
                }}
              />
            </div>
          </div>``
        </form>
      </div>
    {:else}
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <div class="flex flex-col items-center space-y-2 text-center">
          <h2 class="text-2xl font-semibold">Password Reset</h2>
          <p class="text-muted-foreground text-sm">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <!-- Forgot Password Form -->
        <form
          method="POST"
          action={route("/")}
          use:forgotPasswordFormEnhance
          class="space-y-6"
        >
          <Form.Field form={forgotPasswordForm} name="email">
            <Form.Control>
              {#snippet children({ props })}
                <div class="relative">
                  <AtSign
                    class="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2"
                  />
                  <Input
                    {...props}
                    bind:value={$forgotPasswordFormData.email}
                    type="email"
                    class="h-11 pl-10 text-base"
                    placeholder="Email address"
                    autocomplete="email"
                  />
                </div>
              {/snippet}
            </Form.Control>
            <Form.FieldErrors class="text-[0.7rem]" />
          </Form.Field>

          <div class="space-y-4">
            <Form.Button class="h-11 w-full font-semibold" disabled={$forgotPasswordFormSubmitting}>
              {#if $forgotPasswordFormSubmitting}
                <p class="loading-dots">Sending</p>
              {:else}
                Submit
              {/if}
            </Form.Button>

            <div class="text-center">
              <a
                href={route("/signin")}
                class="text-muted-foreground hover:text-primary text-xs transition-colors"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        </form>
      </div>
    {/if}
  </div>
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
