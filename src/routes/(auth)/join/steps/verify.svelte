<script lang="ts">
  import * as Form from "@/components/ui/form";
  import * as InputOTP from "@/components/ui/input-otp";
  import { Countdown } from "@/components/app/countdown";
  import { valibotClient } from "sveltekit-superforms/adapters";
  import { setError, superForm } from "sveltekit-superforms";
  import { resendCode } from "@/components/app/countdown/countdown.svelte";
  import { toast } from "svelte-sonner";
  import { verification } from "../schema";
  import { sellerRegistration as regStore } from "@/stores/seller";
  import { OtpType, UserService } from "$modules/auth";
  import { maskEmail } from "@/utils/helpers";
  import { try_ } from "@/utils";

  import type { PageData } from "../$types";

  let { data, onComplete }: { data: PageData; onComplete?: () => void } = $props();

  let countdownRef = $state<{
    startCountdown: () => boolean;
    stopCountdown: () => void;
    getTimeLeft: () => number;
    isActive: () => boolean;
  } | undefined>(undefined);

  const otpForm = superForm(data.verifyForm, {
    validators: valibotClient(verification),
    dataType: "json",
    SPA: true,
    onUpdate: async ({ form: f }) => {
      if (!f.valid)
        return;

      const [res, err] = await try_(() =>
        UserService.create_seller(regStore.state.userId!, regStore.state.email!, f.data.verification_code),
      );

      if (err) {
        toast.error("Verification failed", {
          description: "Please try again or request a new code",
        });
        return;
      }

      if (!res?.success && !res?.verified) {
        setError(f, "verification_code", "Invalid verification code");
        return;
      }

      if (!res?.success) {
        toast.error("Unknown Error", {
          description: "Please try again later",
        });
        return;
      }

      regStore.verifyEmail();
      onComplete?.();
    },
    onError: () => {
      toast.error("Connection Lost", {
        description: "Please try again...",
      });
    },
  });

  const { form: otpFormData, enhance, submitting } = otpForm;

  const maskedEmail = $derived(maskEmail(regStore.state.email || ""));
</script>

<div class="flex h-full w-full flex-col items-center justify-between gap-5">
  <div class="flex w-full grow flex-col items-center justify-center gap-10 md:max-w-xl">
    <div class="flex w-full flex-col items-center space-y-8">
      <div class="flex w-full flex-col items-center space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Verify your email</h1>
        <div class="flex flex-col items-center gap-1">
          <p class="text-muted-foreground text-xs">
            We've sent a verification code to your email
          </p>
          <span class="text-foreground/90 text-sm">{maskedEmail}</span>
        </div>
      </div>

      <div class="w-full max-w-md">
        <form method="POST" use:enhance class="space-y-5">
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
            <div class="min-h-[1rem] text-xs font-medium">
              <Form.FieldErrors class="text-[0.7rem]" />
            </div>
            <Form.Description class="text-xs">
              Enter the code we sent to your email
            </Form.Description>
          </Form.Field>
          <div class="space-y-4">
            <Form.Button class="h-11 w-full font-semibold" disabled={$submitting}>
              {#if $submitting}
                <p>Verifying</p>
              {:else}
                Verify Email
              {/if}
            </Form.Button>
            <div class="text-center">
              <Countdown
                bind:this={countdownRef}
                config={{
                  duration: 2 * 60,
                  storageKey: "join_countdown",
                }}
                label="Resend code"
                onclick={async () => {
                  const success = await resendCode(regStore.state.userId!, regStore.state.email!, OtpType.Join);
                  if (success && countdownRef) {
                    countdownRef.startCountdown();
                  }
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
