<script lang="ts">
  import type { StepItem } from "../types";

  let { steps, currentStep, onStepChange } = $props<{
    steps: StepItem[];
    currentStep: number;
    onStepChange: (stepValue: string) => void;
  }>();
</script>

<nav aria-label="Progress" class="my-8 hidden md:flex">
  <ol role="list" class="flex items-center gap-x-2 sm:gap-x-6">
    {#each steps as step}
      {@const status
        = step.id < currentStep
          ? "complete"
          : step.id === currentStep
          ? "current"
          : "upcoming"}
      <li>
        {#if status === "complete"}
          <button
            type="button"
            class="group flex items-center gap-x-2"
            onclick={() => onStepChange(step.value)}
          >
            <div class="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
              <step.icon class="text-primary-foreground h-4 w-4" aria-hidden="true" />
            </div>
            <span class="text-primary text-sm font-medium">{step.name}</span>
          </button>
        {:else if status === "current"}
          <button
            type="button"
            class="flex items-center gap-x-2"
            aria-current="step"
            onclick={() => onStepChange(step.value)}
          >
            <div
              class="border-primary flex h-8 w-8 items-center justify-center rounded-full border-2"
            >
              <step.icon class="text-primary h-4 w-4" aria-hidden="true" />
            </div>
            <span class="text-primary text-sm font-medium">{step.name}</span>
          </button>
        {:else}
          <div class="group flex items-center gap-x-2">
            <div
              class="border-muted flex h-8 w-8 items-center justify-center rounded-full border-2"
            >
              <step.icon class="text-muted-foreground h-4 w-4" aria-hidden="true" />
            </div>
            <span class="text-muted-foreground text-sm font-medium">
              {step.name}
            </span>
          </div>
        {/if}
      </li>

      {#if step.id !== steps.length}
        {#if status === "complete"}
          <li class="bg-primary h-0.5 w-12 sm:w-16"></li>
        {:else}
          <li class="bg-muted h-0.5 w-12 sm:w-16"></li>
        {/if}
      {/if}
    {/each}
  </ol>
</nav>
