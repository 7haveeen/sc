<script lang="ts">
  import { page } from "$app/state";
  import AppSidebar from "$lib/components/app/app-sidebar.svelte";
  import NavMenu from "$lib/components/app/nav-menu.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import * as Sidebar from "$lib/components/ui/sidebar";

  const { children } = $props();

  const segments = $derived(page.url.pathname.split("/").filter(Boolean));

  function formatSegment(segment: string) {
    return segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getPathForSegment(index: number, segments: string[]) {
    return `/${segments.slice(0, index + 1).join("/")}`;
  }
</script>

<Sidebar.Provider>
  <AppSidebar class="pr-0" />
  <Sidebar.Inset class="bg-custom-background">
    <header class="flex h-16 shrink-0 items-center gap-2 px-4">
      <div class="flex items-center gap-2">
        <Sidebar.Trigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb.Root>
          <Breadcrumb.List class="text-xs">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            {#each segments as segment, index}
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                {#if index === segments.length - 1}
                  <Breadcrumb.Page>{formatSegment(segment)}</Breadcrumb.Page>
                {:else}
                  <Breadcrumb.Link href={getPathForSegment(index, segments)}>
                    {formatSegment(segment)}
                  </Breadcrumb.Link>
                {/if}
              </Breadcrumb.Item>
            {/each}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
      <div class="ml-auto">
        <NavMenu />
      </div>
    </header>
    <ScrollArea class="mb-3 h-[calc(100svh-80px-12px)]">
      {@render children?.()}
    </ScrollArea>
  </Sidebar.Inset>
</Sidebar.Provider>
