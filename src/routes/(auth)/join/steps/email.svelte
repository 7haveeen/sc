<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import AtSign from "lucide-svelte/icons/at-sign";
  import CheckCircle from "lucide-svelte/icons/check-circle";
  import { superForm } from "sveltekit-superforms";
  import { useDebounce } from "runed";
  import { email } from "../schema";
  import { route } from "@/ROUTES";
  import { toast } from "svelte-sonner";
  import { valibotClient } from "sveltekit-superforms/adapters";
  import { is } from "valibot";
  import { try_ } from "@/utils";
  import { EmailService, OtpService, OtpType, UserService } from "$modules/auth";
  import { sellerRegistration } from "@/stores/seller";
  import { Countdown } from "$lib/components/app/countdown";

  import type { PageData } from "../$types";

  let countdownRef = $state<{
    startCountdown: () => boolean;
    stopCountdown: () => void;
    getTimeLeft: () => number;
    isActive: () => boolean;
  } | undefined>(undefined);

  let { data, onComplete }: { data: PageData; onComplete?: () => void } = $props();

  let isEmailValid = $state(false);

  const form = superForm(data.joinForm, {
    validators: valibotClient(email),
    validationMethod: "onblur",
    dataType: "json",
    SPA: true,
    onUpdate: async ({ form: f }) => {
      if (!f.valid)
        return;

      const sellerId = await sellerRegistration.createUser(f.data.email);

      if (sellerId) {
        const otp = await OtpService.create(sellerId, f.data.email, OtpType.Join);

        if (otp) {
          onComplete?.();

          if (countdownRef) {
            countdownRef.startCountdown();
          }
        }
        else {
          toast.error("Error Sending OTP", {
            description: "Please try again later.",
          });
        }
      }
      else {
        toast.error("Error creating account", {
          description: "Please try again later.",
        });
      }
    },
    onError: () => {
      toast.error("Connection Lost", {
        description: "Please try again...",
      });
    },
  });

  const { form: formData, errors, enhance } = form;

  const {
    delayed: checkDelayed,
    enhance: checkEnhance,
    submit: submitCheckEmail,
  } = superForm(
    { email: "" },
    {
      invalidateAll: false,
      applyAction: false,
      multipleSubmits: "abort",
      validators: false,
      SPA: true,
      onUpdate: async () => {
        if (!$formData.email) {
          isEmailValid = false;
          return;
        }

        const [disposableRes, disposableErr] = await try_(() => EmailService.check($formData.email));

        if (disposableErr) {
          toast.error("Error checking email", {
            description: "Please try again later...",
          });
          return;
        }

        if (disposableRes?.disposable) {
          $errors.email = [disposableRes.message || "Domain not allowed"];
          isEmailValid = false;
          return;
        }

        const [emailExists, emailErr] = await try_(() => UserService.check($formData.email));

        if (emailErr) {
          toast.error("Error checking email", {
            description: "Please try again later...",
          });
          return;
        }

        if (emailExists) {
          $errors.email = ["Email already exists"];
          isEmailValid = false;
          return;
        }

        isEmailValid = true;
      },
      onError: () => {
        toast.error("Connection Lost", {
          description: "Please try again...",
        });
      },
    },
  );

  const validateEmailInput = () => {
    $errors.email = [];
    isEmailValid = false;

    if ($formData.email && is(email.entries.email, $formData.email)) {
      submitCheckEmail();
    }
  };

  const debouncedValidator = useDebounce(validateEmailInput, () => 600);

  let isDisabled = $derived(!isEmailValid || $checkDelayed || !!$errors.email?.length || !$formData.email);

</script>

<div class="flex h-full w-full flex-col items-center justify-between gap-5">
  <div class="flex w-full grow flex-col items-center justify-center gap-10 md:max-w-xl">
    <div class="flex w-full flex-col items-center space-y-8">
      <div class="flex w-full flex-col items-center space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Create your Seller Account</h1>
        <p class="text-muted-foreground text-pretty text-xs">
          Enter your email to get started. We'll send you a verification code.
        </p>
      </div>
      <div class="hidden">
        <Countdown
          bind:this={countdownRef}
          config={{
            duration: 2 * 60,
            storageKey: "join_countdown",
          }}
          label="Resend code"
        />
      </div>
      <div class="w-full max-w-md">
        <form method="POST" class="space-y-4" use:enhance>
          <Form.Field {form} name="email" class="flex w-full flex-col items-center">
            <Form.Control>
              {#snippet children({ props })}
                <div class="relative w-full">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    class="h-12 pl-10 pr-10 text-base"
                    spellcheck="false"
                    autocorrect="off"
                    autocapitalize="off"
                    autocomplete="email"
                    {...props}
                    bind:value={$formData.email}
                    oninput={() => debouncedValidator()}
                  />
                  <span class="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                    <AtSign class="size-5" />
                  </span>
                  {#if !isDisabled}
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle class="size-5" />
                    </div>
                  {/if}
                </div>
              {/snippet}
            </Form.Control>
            <div class="min-h-[1rem] w-full text-xs font-medium">
              {#if $checkDelayed}
                <p class="loading-dots">Checking</p>
              {:else if !isDisabled}
                <p class="text-green-500">Looks good!</p>
              {:else}
                <Form.FieldErrors class="text-[0.7rem]" />
              {/if}
            </div>
          </Form.Field>
          <div class="space-y-6">
            <Form.Button
              class="h-10 w-full"
              disabled={isDisabled}
            >
              Get Started
            </Form.Button>
            <p class="text-muted-foreground/80 text-balance text-center text-xs leading-normal">
              By continuing, you have read and agree to our
              <a href={route("/")} class="hover:text-primary underline underline-offset-4">
                Service Agreement</a
              >,
              <a href={route("/")} class="hover:text-primary underline underline-offset-4">
                Free Membership Agreement
              </a>
              and
              <a href={route("/")} class="hover:text-primary underline underline-offset-4">
                Privacy Policy</a
              >
            </p>
          </div>
        </form>
        <form id="check_email" method="POST" use:checkEnhance></form>
      </div>
    </div>
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
