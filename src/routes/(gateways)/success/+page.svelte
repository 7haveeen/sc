<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import confetti from "canvas-confetti";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import { onMount } from "svelte";

  const orderNumber = $state("ORD-7H-2024-001");
  const orderDate = $state(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );
  const orderAmount = $state("77.18");

  function fireConfetti() {
    const count = 200;
    const defaults = {
      origin: { y: 0.4 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        scalar: 1.2,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  onMount(() => {
    fireConfetti();
  });
</script>

<div class="grid min-h-svh grid-rows-[auto_1fr_auto]">
  <!-- Header -->
  <header class="bg-card sticky top-0 z-50 backdrop-blur-xl">
    <div class="container flex h-14 items-center justify-between px-3 md:px-8">
      <a href="/" class="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
        <ArrowLeft class="size-4" />
        <span class="text-sm font-semibold">Back to Home</span>
      </a>
    </div>
  </header>

  <div class="container px-1 py-8 md:px-8">
    <div class="mx-auto w-full max-w-[500px] space-y-5">
      <!-- Success Card -->
      <Card class="rounded-xl border-none shadow-sm">
        <CardContent class="p-4 md:p-6">
          <div class="flex flex-col items-center space-y-4 text-center">
            <div class="grid size-16 place-items-center rounded-full bg-green-500/20">
              <CircleCheck class="size-8 text-green-500" />
            </div>
            <div class="space-y-1">
              <h1 class="text-xl font-bold md:text-2xl">Order Successful!</h1>
              <p class="text-muted-foreground text-sm">Thank you for your purchase</p>
            </div>

            <Separator class="bg-muted/80 dark:bg-muted/50 my-4" />

            <!-- Order Details -->
            <div class="w-full space-y-4">
              <div class="grid gap-1">
                <span class="text-muted-foreground text-xs">Order Number</span>
                <span class="text-sm font-medium">{orderNumber}</span>
              </div>
              <div class="grid gap-1">
                <span class="text-muted-foreground text-xs">Date</span>
                <span class="text-sm font-medium">{orderDate}</span>
              </div>
              <div class="grid gap-1">
                <span class="text-muted-foreground text-xs">Total Amount</span>
                <span class="text-sm font-medium">US ${orderAmount}</span>
              </div>
            </div>

            <Separator class="bg-muted/80 dark:bg-muted/50 my-4" />

            <div class="text-muted-foreground text-xs">
              A confirmation email has been sent to your email address.
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Order Actions -->
      <Card class="rounded-xl border-none shadow-sm">
        <CardContent class="p-4 md:p-6">
          <div class="flex flex-col gap-3">
            <Button
              class="bg-brand hover:bg-brand/85 h-12 w-full gap-2 rounded-full font-bold text-white"
              href="/orders"
            >
              View Order Details
            </Button>
            <Button variant="outline" class="h-12 w-full gap-2 rounded-full font-bold" href="/shop">
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
