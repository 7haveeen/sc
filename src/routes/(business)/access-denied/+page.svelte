<script lang="ts">
  import { userRune } from "@/stores/runes.svelte";
  import { Button } from "$lib/components/ui/button";
  import ArrowRight from "lucide-svelte/icons/arrow-right";

  const user = $derived(userRune.get());
</script>

<div class="mx-auto flex min-h-[calc(100vh-60px)] flex-col items-center p-4 pt-12">
  <div class="w-full max-w-md space-y-8 text-center">
    <div class="flex justify-center">
      <div class="bg-muted flex size-24 items-center justify-center rounded-full">
        <svg
          class="size-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill-rule="evenodd"
          stroke-linejoin="round"
          stroke-miterlimit="2"
        >
          <path
            class="text-brand fill-current"
            d="M15.678 14.375v8.102c0 .04-.033.073-.073.073H8.421c-.041 0-.073-.033-.073-.073v-8.102c0-.041.032-.074.073-.074h7.184c.04 0 .073.033.073.074zm-5.313 5.841l.242.777 2.039-4.691-.582.008-1.699 3.906zm3.018-4.386l-2.752 6.33h.579l2.983-6.861H9.769v.531h3.614zm-1.64 6.33h.579l.942-2.166-.26-.734-1.261 2.9z"
          />
          <path
            class="text-muted-foreground/20 fill-current"
            d="M8.438 22.644a.3.3 0 0 1-.3.3H3.674c-.804 0-1.456-.652-1.456-1.455V11.167c0-.803.652-1.456 1.456-1.456h16.622a1.46 1.46 0 0 1 1.456 1.456v10.322c0 .803-.653 1.455-1.456 1.455h-4.424a.3.3 0 0 1-.3-.3v-7.962c0-.157-.128-.285-.285-.285H8.723c-.157 0-.285.128-.285.285v7.962z"
          />
          <path
            class="text-brand fill-current"
            d="M1.425 11.343l-.04-.05C.779 10.527.556 9.527.78 8.576l1.425-6.048a1.91 1.91 0 0 1 1.86-1.472h15.87a1.91 1.91 0 0 1 1.86 1.472l1.425 6.048c.095.403.11.814.049 1.213-.082.543-.304 1.063-.654 1.504-.606.766-1.529 1.212-2.505 1.212h-.133c-1.074-.054-2.007-.644-2.537-1.508-.53.864-1.464 1.454-2.538 1.508h-.32c-1.098-.055-2.05-.671-2.573-1.567-.523.896-1.475 1.512-2.573 1.567h-.32c-1.075-.054-2.01-.645-2.539-1.51-.53.865-1.465 1.456-2.54 1.51H3.89c-.955 0-1.858-.427-2.465-1.162z"
          />
          <path
            class="text-background fill-current"
            d="M.695 9.364a3.15 3.15 0 0 1 .085-.788l.004-.016h22.432l.004.016a3.15 3.15 0 0 1 .085.788H.695z"
          />
        </svg>
      </div>
    </div>

    <div class="space-y-2.5">
      <h1 class="text-2xl font-semibold tracking-tight">Access Denied</h1>
      <p class="text-muted-foreground text-sm">
        Hi {user?.name?.split(" ")[0]}, you need permission to access 7haven. Contact your
        organization administrator to request access to the platform.
      </p>
    </div>

    <div class="space-y-4">
      <div class="bg-card border-border relative rounded-lg border p-4">
        <div class="space-y-3">
          <h3 class="text-sm font-medium">What you'll get access to</h3>
          <ul class="text-muted-foreground space-y-2.5 text-left text-xs">
            <li class="flex items-center gap-2">
              <ArrowRight class="text-brand size-3.5" />
              <span>Complete e-commerce suite</span>
            </li>
            <li class="flex items-center gap-2">
              <ArrowRight class="text-brand size-3.5" />
              <span>Real-time analytics and reporting</span>
            </li>
            <li class="flex items-center gap-2">
              <ArrowRight class="text-brand size-3.5" />
              <span>Inventory and order management</span>
            </li>
            <li class="flex items-center gap-2">
              <ArrowRight class="text-brand size-3.5" />
              <span>Team collaboration tools</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="grid gap-3">
        <Button href="/support" variant="outline" class="w-full">Contact Support</Button>
      </div>
    </div>
  </div>
</div>
