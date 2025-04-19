<script lang="ts" module>
  import type { WithElementRef } from "bits-ui";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { toast } from "svelte-sonner";
  import { OtpService, OtpType } from "$modules/auth";
  import { PersistedState } from "runed";
  import { BROWSER } from "esm-env";

  export type CountdownConfig = {
    duration: number;
    storageKey: string;
  };

  export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      config: CountdownConfig;
      label: string;
      onExpired?: () => void;
      onStart?: () => void;
    };

  export const COUNTDOWN = {
    INTERVAL: 1000,
  } as const;

  // Create a helper function to get a countdown instance
  export function createCountdown(config: CountdownConfig) {
    const defaultState = {
      endTime: null as number | null,
    };

    let store: { current: { endTime: number | null } };

    if (!BROWSER) {
      store = {
        get current() {
          return { ...defaultState };
        },
      };
    }
    else {
      store = new PersistedState<{
        endTime: number | null;
      }>(config.storageKey, defaultState, {
        syncTabs: true,
        storage: "local",
      });
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    function calculateTimeLeft(endTime: number): number {
      return Math.ceil((endTime - Date.now()) / 1000);
    }

    function getTimeLeft(): number {
      const { endTime } = store.current;
      if (!endTime)
        return 0;
      return calculateTimeLeft(endTime);
    }

    function clearInterval() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    }

    function startCountdown() {
      const currentTimeLeft = getTimeLeft();
      if (currentTimeLeft > 0)
        return false;

      const endTime = Date.now() + config.duration * 1000;
      store.current = { endTime };
      startInterval();
      return true;
    }

    function stopCountdown() {
      clearInterval();
      store.current = { endTime: null };
    }

    function startInterval() {
      clearInterval();

      intervalId = setInterval(() => {
        const timeLeft = getTimeLeft();
        if (timeLeft <= 0) {
          store.current = { endTime: null };
          clearInterval();
        }
      }, COUNTDOWN.INTERVAL);
    }

    // Initialize if there's an existing countdown and in browser environment
    if (BROWSER) {
      const { endTime } = store.current;
      if (endTime && calculateTimeLeft(endTime) > 0) {
        startInterval();
      }
      else if (endTime) {
        store.current = { endTime: null };
      }
    }

    return {
      startCountdown,
      stopCountdown,
      getTimeLeft,
      get isActive() {
        return getTimeLeft() > 0;
      },
    };
  }

  export async function resendCode(userId: string, email: string, otpType: OtpType) {
    if (!userId || !email)
      return false;

    const res = await OtpService.resend(userId, email, otpType);

    if (!res.success) {
      toast.error(res.message ?? "Failed to resend code");
      return false;
    }
    else {
      toast.success("Verification Code Sent", {
        description: "Please check your email...",
      });
      return true;
    }
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { fade } from "svelte/transition";

  let {
    class: className,
    config,
    label,
    onExpired = () => {},
    onStart = () => {},
    ref = $bindable(null),
    ...restProps
  }: ButtonProps = $props();

  // Use the module-level function to create our countdown instance
  const countdown = createCountdown(config);

  // Local reactive state
  let timeLeft = $state(0);
  let isInitialized = $state(false);

  // Update the time remaining at regular intervals
  $effect(() => {
    const intervalId = setInterval(() => {
      timeLeft = countdown.getTimeLeft();
      if (timeLeft === 0 && countdown.isActive === false) {
        onExpired();
      }
    }, COUNTDOWN.INTERVAL);

    isInitialized = true;
    timeLeft = countdown.getTimeLeft();

    return () => clearInterval(intervalId);
  });

  // Function to handle button click
  function handleClick() {
    if (!countdown.isActive) {
      const started = countdown.startCountdown();
      if (started) {
        timeLeft = countdown.getTimeLeft();
        onStart();
      }
    }
  }

  // Export methods for parent component to access
  export function startCountdown() {
    const started = countdown.startCountdown();
    if (started) {
      timeLeft = countdown.getTimeLeft();
      onStart();
    }
    return started;
  }

  export function stopCountdown() {
    countdown.stopCountdown();
    timeLeft = 0;
  }

  export function getTimeLeft() {
    return countdown.getTimeLeft();
  }

  export function isActive() {
    return countdown.isActive;
  }
</script>

<button
  bind:this={ref}
  class={cn(
    "focus-visible:ring-ring text-muted-foreground inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-xs font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    className,
  )}
  type="button"
  disabled={timeLeft > 0}
  onclick={handleClick}
  {...restProps}
>
  {#if isInitialized}
    <span in:fade={{ duration: 150 }} out:fade={{ duration: 150 }}>
      {#if timeLeft > 0}
        {#if timeLeft >= 60}
          {label} in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        {:else}
          {label} in {timeLeft + "s"}
        {/if}
      {:else}
        {label}
      {/if}
    </span>
  {/if}
</button>
