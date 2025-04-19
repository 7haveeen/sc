<script lang="ts">
  import type { WithElementRef } from "bits-ui";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  let {
    ref = $bindable(null),
    value = $bindable(""),
    class: className,
    ...restProps
  }: WithElementRef<HTMLInputAttributes> = $props();

  const sanitize = (input: string) =>
    input
      .replace(/[^\d+]/g, "")
      .replace(/\+/g, (match, index) => index === 0 ? match : "")
      .replace(/^\+0+/, "+")
      .slice(0, 14);

  const isInvalidKey = (key: string) =>
    (key === "+" && value.includes("+")) || (key === "0" && value === "+") || !/^[0-9+]$/.test(key);
</script>

<input
  bind:this={ref}
  bind:value
  maxlength={14}
  autocomplete="tel"
  spellcheck="false"
  onkeypress={e => isInvalidKey(e.key) && e.preventDefault()}
  onpaste={(e) => {
    e.preventDefault();
    value = sanitize(e.clipboardData?.getData("text") ?? "");
  }}
  oninput={e => (value = sanitize((e.target as HTMLInputElement).value))}
  {...restProps}
  class={cn(
    "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className,
  )}
/>
