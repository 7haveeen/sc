<script lang="ts">
  import type { WithElementRef, WithoutChildren } from "bits-ui";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import { cn } from "$lib/utils.js";

  type Props = {
    maxHeight?: number;
    disabled?: boolean;
  } & WithoutChildren<WithElementRef<HTMLTextareaAttributes>>;

  let {
    ref = $bindable(null),
    value = $bindable(),
    maxHeight = 60,
    disabled = false,
    class: className,
    ...restProps
  }: Props = $props();

  const resize = () => {
    if (!ref)
      return;
    ref.style.height = "auto";
    ref.style.height = `${Math.min(ref.scrollHeight, maxHeight)}px`;
  };

  $effect(() => {
    if (!disabled && ref)
      resize();
  });
</script>

<textarea
  bind:this={ref}
  bind:value
  {disabled}
  oninput={resize}
  class={cn(
    "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full overflow-hidden rounded-md border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className,
  )}
  {...restProps}
></textarea>
