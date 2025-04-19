<script lang="ts">
  import { route } from "@/ROUTES";
  import { userRune } from "@/stores/runes.svelte";
  import { goto } from "$app/navigation";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { cn, try_ } from "$lib/utils";
  import Check from "lucide-svelte/icons/check";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { shopRepo } from "$modules/org";
  import type { Shop } from "$modules/org";
  import { userRepo } from "$modules/auth";

  let permittedShops = $state<Shop[]>([]);
  let isLoading = $state(true);
  let activeShop = $state<Shop | null>(null);
  let isUpdatingShop = $state(false);

  const user = $derived(userRune.get());

  async function loadShops() {
    const [owned] = await try_(() => shopRepo.find());
    if (!owned?.length) {
      goto(route("/access-denied"), {
        invalidateAll: true,
        replaceState: true,
      });
      return;
    }

    permittedShops = owned;
    const matchingShop = owned.find(shop => shop.publicId === user?.activeShopId);

    if (!matchingShop) {
      await updateActiveShop(owned[0]);
    }
    else {
      activeShop = matchingShop;
    }

    isLoading = false;
  }

  async function updateActiveShop(shop: Shop) {
    if (!user)
      return;

    isUpdatingShop = true;
    await userRepo.update(user.id, { activeShopId: shop.publicId });
    activeShop = shop;

    goto(route("/"), { replaceState: true, invalidateAll: true });
    isUpdatingShop = false;
  }

  $effect(() => {
    if (user) {
      loadShops();
    }
  });
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton {...props} class=" h-auto rounded-xl p-1">
            {#if isLoading}
              <div class="p-[3px]">
                <Skeleton class="size-8 rounded-full" />
              </div>
              <div class="grid flex-1">
                <div class="space-y-1.5">
                  <Skeleton class="h-3 w-3/4" />
                  <Skeleton class="h-2.5 w-1/3" />
                </div>
              </div>
              <Skeleton class="size-4" />
            {:else}
              <div
                class={cn(
                  "relative p-[3px]",
                  isUpdatingShop && "before:border-brand/30 after:border-brand before:absolute before:inset-0 before:rounded-full before:border-[1.5px] before:border-dotted after:absolute after:inset-0 after:animate-[spin_0.7s_linear_infinite] after:rounded-full after:border-[1.5px] after:border-dotted after:border-t-transparent",
                )}
              >
                <Avatar.Root class="size-8 transition-opacity hover:opacity-80">
                  <Avatar.Image
                    src={activeShop?.logo}
                    alt={`${activeShop?.name}-Logo`}
                    class="object-cover"
                  />
                  <Avatar.Fallback>
                    {activeShop?.name?.[0]?.toUpperCase() ?? "U"}
                  </Avatar.Fallback>
                </Avatar.Root>
              </div>
              <div class="grid flex-1">
                <span class="truncate text-xs font-semibold"
                >{activeShop?.name ?? "Select a shop"}</span
                >
                {#if activeShop}
                  <span class="truncate text-xs">{activeShop.subscription}</span>
                {/if}
              </div>
              <ChevronDown class="opacity-50" />
            {/if}
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-60 rounded-xl p-1" align="start" side="bottom" sideOffset={4}>
        {#each permittedShops as shop (shop.publicId)}
          <DropdownMenu.Item
            onSelect={() => updateActiveShop(shop)}
            class="flex items-center gap-3 rounded-lg p-2 group data-[highlighted]:bg-accent/40"
          >
            <svg
              class="text-muted-foreground/50 -ml-1.5 size-4 group-hover:text-brand"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
              ></path>
            </svg>
            <Avatar.Root class="-ml-1.5 size-6">
              <Avatar.Image src={shop.logo} alt={`${shop?.name}Logo`} class="object-cover" />
              <Avatar.Fallback class="bg-muted">{shop.name[0].toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            <div class="flex min-w-0 flex-col">
              <span class="truncate text-xs font-medium">{shop.name}</span>
              <span class="text-muted-foreground truncate text-xs">{shop.slug}</span>
            </div>
            {#if shop.publicId === activeShop?.publicId}
              <Check class="text-brand ml-auto size-4" />
            {/if}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
