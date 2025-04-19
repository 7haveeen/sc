<script lang="ts">
  type VerificationStep = {
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    date?: Date;
  };

  const { steps } = $props<{ steps: VerificationStep[] }>();
</script>

<div class="relative">
  {#each steps as step, i}
    <div class="flex gap-4 pb-8 last:pb-0">
      <div class="relative flex flex-col items-center">
        <div
          class="size-3 rounded-full ring-[3px] {step.status === "completed"
            ? "bg-brand ring-brand/20"
            : step.status === "in-progress"
            ? "bg-amber-500 ring-amber-500/20"
            : "bg-muted-foreground/30 ring-muted-foreground/10"}"
        ></div>
        {#if i !== steps.length - 1}
          <div
            class="absolute top-3 h-full w-[2px] {step.status === "completed"
              ? "bg-brand/30"
              : "bg-border/40"}"
          ></div>
        {/if}
      </div>
      <div class="flex-1 pb-8 last:pb-0">
        <div class="flex flex-col gap-0.5">
          <h3 class="text-sm font-medium">{step.title}</h3>
          <p class="text-muted-foreground text-xs">
            {step.description}
          </p>
          {#if step.date}
            <p class="text-muted-foreground/70 mt-1 text-[0.7rem]">
              {step.date.toLocaleString()}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
