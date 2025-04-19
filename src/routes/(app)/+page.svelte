<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import dayjs from "dayjs";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import DollarSign from "lucide-svelte/icons/dollar-sign";
  import Library from "lucide-svelte/icons/library-big";
  import ListTodo from "lucide-svelte/icons/list-todo";
  import Package from "lucide-svelte/icons/package";
  import PlusCircle from "lucide-svelte/icons/plus-circle";
  import Tickets from "lucide-svelte/icons/tickets";
  import TrendingDown from "lucide-svelte/icons/trending-down";
  import TrendingUp from "lucide-svelte/icons/trending-up";
  import TriangleAlert from "lucide-svelte/icons/triangle-alert";

  const GREETINGS = [
    { range: [5, 12], text: "Good morning" },
    { range: [12, 17], text: "Good afternoon" },
    { range: [17, 21], text: "Good evening" },
  ] as const;

  const greeting = $derived(
    GREETINGS.find(({ range: [start, end] }) => {
      const hour = dayjs().hour();
      return hour >= start && hour < end;
    })?.text ?? "Good night",
  );

  const { data } = $props();

  const user = $derived(data.user);
</script>

<div class="flex flex-col">
  <div class="space-y-6 px-3 py-3 md:px-10 md:py-6">
    <!-- Alert Section -->
    <Alert.Root
      class="rounded-sm border border-dashed border-amber-500 bg-amber-50 py-2 dark:border-amber-900/50 dark:bg-amber-900/30"
    >
      <Alert.Description
        class="flex items-center gap-4 text-pretty text-[0.7rem] text-amber-700 dark:text-amber-400"
      >
        <span>
          <TriangleAlert class="size-4 text-amber-700 lg:block dark:text-amber-400" />
        </span>
        <p>
          Your shop and products are currently hidden from public view due to incomplete business
          information,
          <a
            href="/settings/shop?tab=business"
            class="hover:text-amber-900 dark:hover:text-amber-100"
          >Click here to update your business information.</a
          >
        </p>
      </Alert.Description>
    </Alert.Root>

    <!-- Header Section -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <h1 class="text-lg font-bold">
          {`${greeting + (user?.name ? `, ${user.name.split(" ")[0]}` : "")}!`}
        </h1>
        <p class="text-muted-foreground/80 text-pretty text-xs">
          Here's what's happening with your store today
        </p>
      </div>
      <Button variant="secondary" class="hidden h-10 gap-2 px-6 md:flex">
        <PlusCircle class="size-4" />
        Add New Product
      </Button>
    </div>

    <!-- Stats Overview -->
    <div class="grid gap-4 sm:gap-6 lg:grid-cols-6">
      <Card.Root class="space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow lg:col-span-4">
        <Card.Header class="p-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="space-y-2">
                <Card.Title>Business Insights</Card.Title>
                <p class="text-muted-foreground text-pretty text-xs">
                  Real-time data until UTC+2 04:00 (Compared to yesterday)
                </p>
              </div>
            </div>
            <a
              href="/"
              class="text-muted-foreground hover:text-foreground -mr-2 inline-flex items-center gap-1 text-xs"
            >
              more
              <ChevronRight class=" mt-[2.5px] size-4" />
            </a>
          </div>
        </Card.Header>
        <Card.Content class="p-0">
          <div class="flex flex-col items-center">
            <div class="w-full">
              <div class="relative grid grid-cols-2 sm:flex sm:space-x-8">
                <div class="relative mb-4 mr-5 flex flex-1 items-center md:m-0">
                  <div>
                    <p class="text-base font-bold md:text-lg">156</p>
                    <p class="text-muted-foreground text-xs md:text-sm">All Orders</p>
                  </div>
                  <span
                    class="absolute right-0 top-1 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <TrendingUp class="size-3" />
                    1.75%
                  </span>
                </div>
                <div class="relative mb-4 ml-5 flex flex-1 items-center sm:order-3 md:m-0">
                  <div>
                    <p class="text-base font-bold md:text-lg">2.4k</p>
                    <p class="text-muted-foreground text-xs md:text-sm">Page Views</p>
                  </div>
                  <span
                    class="absolute right-0 top-1 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <TrendingUp class="size-3" />
                    8.45%
                  </span>
                </div>
                <div class="relative mr-5 mt-4 flex flex-1 items-center sm:order-5 md:m-0">
                  <div>
                    <p class="text-base font-bold md:text-lg">3.2%</p>
                    <p class="text-muted-foreground text-xs md:text-sm">Conversion Rate</p>
                  </div>
                  <span
                    class="absolute right-0 top-1 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    <TrendingDown class="size-3" />
                    12%
                  </span>
                </div>
                <div class="relative ml-5 mt-4 flex flex-1 items-center sm:order-7 md:m-0">
                  <div>
                    <p class="text-base font-bold md:text-lg">4.8</p>
                    <p class="text-muted-foreground text-xs md:text-sm">Customer Rating</p>
                  </div>
                  <span
                    class="absolute right-0 top-1 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <TrendingUp class="size-3" />
                    14.36%
                  </span>
                </div>

                <Separator
                  class="absolute left-0 right-0 top-1/2 -translate-y-1/2 opacity-20 sm:hidden"
                />
                <Separator
                  class="absolute bottom-0 left-1/2 top-0 -translate-x-1/2 opacity-20 sm:hidden"
                  orientation="vertical"
                />

                <Separator orientation="vertical" class="hidden opacity-50 sm:order-2 sm:block" />
                <Separator orientation="vertical" class="hidden opacity-50 sm:order-4 sm:block" />
                <Separator orientation="vertical" class="hidden opacity-50 sm:order-6 sm:block" />
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Shop Performance Card -->
      <Card.Root
        class="flex h-full flex-col space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow lg:col-span-2"
      >
        <Card.Header class="p-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="space-y-2">
                <Card.Title>Shop Performance</Card.Title>
                <p class="text-muted-foreground text-xs">Track your shop's performance</p>
              </div>
            </div>
            <a
              href="/tickets"
              class="text-muted-foreground hover:text-foreground -mr-2 inline-flex items-center gap-1 text-xs"
            >
              more
              <ChevronRight class=" mt-[2.5px] size-4" />
            </a>
          </div>
        </Card.Header>
        <Card.Content class="flex flex-1 flex-col justify-end p-0">
          <div>
            <h3 class="text-muted-foreground text-lg font-semibold">Excellent</h3>
            <p class="text-muted-foreground text-xs">All metrics are meeting the targets</p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <!-- Order Management Card -->
      <Card.Root class="flex h-full flex-col space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow ">
        <Card.Header class="p-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <ListTodo class="size-4 text-green-600 dark:text-green-400" />
              </div>
              <Card.Title>Order Management</Card.Title>
            </div>
            <a
              href="/tickets"
              class="text-muted-foreground hover:text-foreground -mr-2 inline-flex items-center gap-1 text-xs"
            >
              more
              <ChevronRight class=" mt-[2.5px] size-4" />
            </a>
          </div>
        </Card.Header>
        <Card.Content class="flex flex-1 flex-col p-0">
          <ul class="space-y-2">
            <li class="flex items-center justify-between text-xs md:text-sm">
              <span class="text-muted-foreground">To be shipped</span>
              <span class="text-muted-foreground font-medium">3</span>
            </li>
            <li class="flex items-center justify-between text-xs md:text-sm">
              <span class="text-muted-foreground">Returned </span>
              <span class="text-muted-foreground font-medium">1</span>
            </li>
          </ul>
        </Card.Content>
      </Card.Root>

      <!-- Inventory Management Card -->
      <Card.Root class="flex h-full flex-col space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow ">
        <Card.Header class="p-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <Library class="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Card.Title>Inventory Management</Card.Title>
            </div>
            <a
              href="/tickets"
              class="text-muted-foreground hover:text-foreground -mr-2 inline-flex items-center gap-1 text-xs"
            >
              more
              <ChevronRight class="mt-[2.5px] size-4" />
            </a>
          </div>
        </Card.Header>
        <Card.Content class="flex flex-1 flex-col items-center justify-center p-0">
          <div class="space-y-2 text-center opacity-40">
            <div class="space-y-1">
              <h3 class="text-base font-semibold">Great job!</h3>
              <p class="text-muted-foreground text-xs">
                <span>You've no pending tasks!</span>
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- My Tickets Card -->
      <Card.Root class="flex h-full flex-col space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow ">
        <Card.Header class="p-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                <Tickets class="size-4 text-orange-600 dark:text-orange-400" />
              </div>
              <Card.Title>My Tickets</Card.Title>
            </div>
            <a
              href="/tickets"
              class="text-muted-foreground hover:text-foreground -mr-2 inline-flex items-center gap-1 text-xs"
            >
              more
              <ChevronRight class="mt-[2.5px] size-4" />
            </a>
          </div>
        </Card.Header>
        <Card.Content class="flex flex-1 flex-col items-center justify-center p-0">
          <div class="space-y-2 text-center opacity-40">
            <div class="space-y-1">
              <h3 class="text-base font-semibold">Hooray!</h3>
              <p class="text-muted-foreground text-xs">
                <span>You've no open tickets yet!</span>
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Performance Analytics -->
    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <Card.Root class="space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow ">
        <Card.Header class="p-0">
          <div class="space-y-2">
            <Card.Title>Revenue Analytics</Card.Title>
            <p class="text-muted-foreground text-xs">Daily revenue trends and patterns</p>
          </div>
        </Card.Header>
        <Card.Content class="p-0">
          <div class="relative h-[300px] w-full">
            <div
              class="absolute inset-0 rounded-lg bg-gradient-to-b from-blue-500/20 to-transparent"
            ></div>
            <div
              class="from-background absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t to-transparent"
            ></div>
          </div>
          <div class="text-muted-foreground mt-4 flex justify-between text-sm">
            {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as day}
              <span>{day}</span>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Top Products -->
      <Card.Root class="space-y-4 border-0 p-4 shadow-sm md:p-6 md:shadow ">
        <Card.Header class="p-0">
          <div class="space-y-2">
            <Card.Title>Best Sellers</Card.Title>
            <p class="text-muted-foreground text-xs">Top performing categories</p>
          </div>
        </Card.Header>
        <Card.Content class="p-0">
          <div class="space-y-6">
            {#each [{ name: "Oil Filter Pro X", sales: 52, revenue: "15,600 USD", growth: 12 }, { name: "Premium Brake Pads", sales: 45, revenue: "13,500 USD", growth: 8 }, { name: "Engine Oil 5W-30", sales: 38, revenue: "11,400 USD", growth: -3 }] as product}
              <div class="relative">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <p class="font-medium">{product.name}</p>
                    <div class="text-muted-foreground flex items-center gap-3 text-sm">
                      <span class="flex items-center gap-1">
                        <Package class="h-4 w-4" />
                        {product.sales} units
                      </span>
                      <span>•</span>
                      <span class="flex items-center gap-1">
                        <DollarSign class="h-4 w-4" />
                        {product.revenue}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    class={product.growth > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"}
                  >
                    {product.growth > 0 ? "+" : ""}{product.growth}%
                  </Badge>
                </div>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
