<script lang="ts">
  import { userRune } from "@/stores/runes.svelte";
  import { LogoutButton } from "$lib/components/app/logout-button";
  import ThemeSwitcher from "$lib/components/app/theme-switcher.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import BadgeCheck from "lucide-svelte/icons/badge-check";
  import Bell from "lucide-svelte/icons/bell";
  import CreditCard from "lucide-svelte/icons/credit-card";
  import LogOut from "lucide-svelte/icons/log-out";
  import SearchIcon from "lucide-svelte/icons/search";

  import Label from "../ui/label/label.svelte";

  const user = $derived(userRune.get());

  const hasNotifications = $state(true);
</script>

<div class="flex w-full items-center justify-between gap-4">
  <div class="relative hidden w-96 items-center md:flex">
    <SearchIcon class="text-muted-foreground absolute left-3 h-4 w-4" />
    <Input
      type="search"
      name="main_search"
      placeholder="Search..."
      class="bg-muted/50 h-9 rounded-full border-none pl-10 focus-visible:ring-0"
    />
  </div>

  <div class="flex items-center gap-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div class="relative">
          {#if hasNotifications}
            <span
              class="bg-brand border-custom-background absolute -right-1 z-10 size-3.5 rounded-full border-[2.5px]"
            ></span>
          {/if}
          <Avatar.Root class="size-9 border transition-opacity hover:opacity-80">
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
            <p class="truncate text-sm font-medium">{user?.name}</p>
            <p class="text-muted-foreground truncate text-xs">
              {user?.email}
            </p>
          </div>
        </div>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item class="flex h-10 items-center px-3">
            <div class="mr-2 flex w-4">
              <BadgeCheck class="size-4" />
            </div>
            <span>Account</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="flex h-10 items-center px-3">
            <div class="mr-2 flex w-4">
              <CreditCard class="size-4" />
            </div>
            <span>Billing</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="flex h-10 items-center px-3">
            <div class="mr-2 flex w-4">
              <Bell class="size-4" />
            </div>
            <span>Notifications</span>
            <Label
              class="bg-primary/10 text-primary ml-auto rounded-2xl px-3 py-0.5 text-xs font-medium"
            >
              3
            </Label>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
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
  </div>
</div>
