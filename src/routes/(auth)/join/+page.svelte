<script lang="ts">
  // UI Components
  import { Button } from "$lib/components/ui/button";
  import { BrandIcon } from "$lib/components/icons/logo";

  // Icons
  import Mail from "lucide-svelte/icons/mail";
  import ShieldCheck from "lucide-svelte/icons/shield-check";
  import CheckCircle2 from "lucide-svelte/icons/check-circle-2";

  // Utils
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { setQueryParam } from "$lib/utils/url";
  import { route } from "@/ROUTES";

  // Step components
  import EmailStep from "./steps/email.svelte";
  import VerifyStep from "./steps/verify.svelte";
  import SecureStep from "./steps/secure.svelte";
  import StepNavigator from "./steps/navigator.svelte";

  // Types
  import type { StepItem } from "./types";

  let { data } = $props();

  // Define the steps for the wizard
  const steps: StepItem[] = [
    { id: 1, name: "Email", value: "email", icon: Mail },
    { id: 2, name: "Verify", value: "verify", icon: CheckCircle2 },
    { id: 3, name: "Secure", value: "secure", icon: ShieldCheck },
  ];

  // Get the current step from the URL query parameter
  let currentStepValue = $state(page.url.searchParams.get("step") || "email");

  // Get the current step index
  let currentStep = $derived(
    steps.findIndex(step => step.value === currentStepValue) >= 0
      ? steps.findIndex(step => step.value === currentStepValue) + 1
      : 1,
  );

  // Navigate to a step
  const navigateToStep = (stepValue: string): void => {
    setQueryParam("step", stepValue);
    currentStepValue = stepValue;
  };

  // Handle step navigation within the component
  const handleStepChange = (stepValue: string): void => {
    const targetIndex = steps.findIndex(step => step.value === stepValue);
    if (targetIndex <= currentStep - 1) {
      navigateToStep(stepValue);
    }
  };
</script>

<div class="mx-auto grid grid-rows-[60px_1fr] md:container">
  <!-- Header/Navigation -->
  <div
    class="bg-background border-border/60 sticky top-0 z-50 grid grid-cols-2 items-center border-b px-3 md:px-0"
  >
    <a href={route("/")} class="flex items-center">
      <BrandIcon class="w-16" />
    </a>
    <div class="flex flex-row items-center justify-end gap-4">
      <a href={route("/")} class="text-muted-foreground hover:text-primary text-xs">Need Help?</a>
      <Button variant="outline" class="h-7 px-6 text-xs" onclick={() => goto(route("/signin"))}>
        Login
      </Button>
    </div>
  </div>

  <div class="flex flex-col items-center px-4 pt-10">
    <!-- Steps Navigation -->
    <StepNavigator
      {steps}
      {currentStep}
      onStepChange={handleStepChange}
    />

    <!-- Page Content / Steps -->
    <div class="w-full max-w-xl pt-14 md:pt-0">
      {#key currentStepValue}
        {#if currentStepValue === "email"}
          <EmailStep
            {data}
            onComplete={() => navigateToStep("verify")}
          />
        {:else if currentStepValue === "verify"}
          <VerifyStep
            {data}
            onComplete={() => navigateToStep("secure")}
          />
        {:else if currentStepValue === "secure"}
          <SecureStep
            {data}
          />
        {/if}
      {/key}
    </div>
  </div>
</div>
