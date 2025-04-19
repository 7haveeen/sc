<script lang="ts">
  import LogoutButton from "@/components/app/logout-button/logout-button.svelte";
  import ThemeSwitcher from "@/components/app/theme-switcher.svelte";
  import { route } from "@/ROUTES";
  import { userRune } from "@/stores/runes.svelte";
  import { BrandIcon } from "$lib/components/icons/logo";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import LogOut from "lucide-svelte/icons/log-out";

  const user = $derived(userRune.get());

  const { children } = $props();
</script>

<div class="mx-auto grid grid-rows-[60px_1fr] md:container">
  <div
    class="bg-background border-border/60 sticky top-0 z-50 grid grid-cols-2 items-center border-b px-3 md:px-0"
  >
    <a href={route("/")} class="flex items-center">
      <BrandIcon class="w-16" />
    </a>
    <div class="flex flex-row items-center justify-end gap-4">
      <a href={route("/")} class="text-muted-foreground hover:text-primary text-xs"> Need Help? </a>
      {#if user}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <div class="relative">
              <Avatar.Root class="size-9 transition-opacity hover:opacity-80">
                <Avatar.Image src={user?.avatar} alt={user?.name} />
                <Avatar.Fallback class="rounded-full">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </Avatar.Fallback>
              </Avatar.Root>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="mt-1 w-56 rounded-lg">
            <div class="px-2 py-2.5">
              <div class="flex flex-col">
                <p class="truncate text-sm font-medium">
                  {user?.name}
                </p>
                <p class="text-muted-foreground truncate text-xs">
                  {user?.email}
                </p>
              </div>
            </div>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <div class="px-3 py-2">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-sm">Theme</span>
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item class="flex h-10 items-center px-0">
              <LogoutButton variant="ghost" class="w-full justify-start">
                <div class="flex items-center space-x-2">
                  <LogOut class="size-4" />
                </div>
                <span>Log out</span>
              </LogoutButton>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    </div>
  </div>
  {@render children?.()}
</div>
