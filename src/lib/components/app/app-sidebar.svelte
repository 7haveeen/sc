<script lang="ts">
  import type { ComponentProps } from "svelte";

  import ShopSwitcher from "@/components/app/shop-switcher.svelte";
  import { isActivePath } from "@/utils";
  import { page } from "$app/state";
  import NavBusiness from "$lib/components/app/nav-business.svelte";
  import NavMain from "$lib/components/app/nav-main.svelte";
  import NavSecondary from "$lib/components/app/nav-secondary.svelte";
  import NavUser from "$lib/components/app/nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { useSidebar } from "$lib/components/ui/sidebar";
  import ChartPie from "lucide-svelte/icons/chart-pie";
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import House from "lucide-svelte/icons/house";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import Send from "lucide-svelte/icons/send";
  import Settings2 from "lucide-svelte/icons/settings-2";
  import Shirt from "lucide-svelte/icons/shirt";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import Users from "lucide-svelte/icons/users";

  import ScrollArea from "../ui/scroll-area/scroll-area.svelte";

  const currentPath = $derived(page.url.pathname);

  const isItemActive = $derived((item: { url: string; items?: { url: string }[] }) => {
    const isMainActive = isActivePath(currentPath, item.url);
    const isSubActive = item.items?.some(subItem => isActivePath(currentPath, subItem.url));
    return isMainActive || isSubActive;
  });

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: House,
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
        items: [
          {
            title: "All Orders",
            url: "/orders",
          },
          {
            title: "Abandoned",
            url: "/orders/abandoned",
          },
          {
            title: "Drafts",
            url: "/orders/drafts",
          },
        ],
      },
      {
        title: "Products",
        url: "/products",
        icon: Shirt,
        items: [
          {
            title: "All Products",
            url: "/products",
          },
          {
            title: "Collections",
            url: "/products/collections",
          },
          {
            title: "Categories",
            url: "/products/categories",
          },
          {
            title: "Inventory",
            url: "/products/inventory",
          },
        ],
      },
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        items: [
          {
            title: "All Customers",
            url: "/customers",
          },
          {
            title: "Segments",
            url: "/customers/segments",
          },
          {
            title: "Reviews",
            url: "/customers/reviews",
          },
        ],
      },
    ],
    navBusiness: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: "Shop",
            url: "/settings/shop",
          },
          {
            title: "Team",
            url: "/settings/team",
          },
          {
            title: "Billing",
            url: "/settings/billing",
          },
          {
            title: "Limits",
            url: "/settings/limits",
          },
        ],
      },
      {
        title: "Sales & Marketing",
        url: "/sales",
        icon: ChartPie,
      },
      {
        title: "More",
        url: "/more",
        icon: Ellipsis,
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "/support",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "/feedback",
        icon: Send,
      },
    ],
  };

  const processedNavMain = $derived(
    data.navMain.map(item => ({
      ...item,
      isActive: isItemActive(item),
    })),
  );

  const processedNavBusiness = $derived(
    data.navBusiness.map(item => ({
      ...item,
      isActive: isItemActive(item),
    })),
  );

  const processedNavSecondary = $derived(
    data.navSecondary.map(item => ({
      ...item,
      isActive: isItemActive(item),
    })),
  );

  const sidebar = useSidebar();

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header class="pr-3">
    <ShopSwitcher />
  </Sidebar.Header>
  <Sidebar.Content>
    <ScrollArea class="flex-1 pr-1">
      <div class="flex h-full flex-col">
        <NavMain items={processedNavMain} />
        <NavBusiness items={processedNavBusiness} />
        <div class="flex-1"></div>
        <NavSecondary items={processedNavSecondary} />
      </div>
    </ScrollArea>
  </Sidebar.Content>
  {#if sidebar.isMobile}
    <Sidebar.Footer>
      <NavUser />
    </Sidebar.Footer>
  {/if}
</Sidebar.Root>
