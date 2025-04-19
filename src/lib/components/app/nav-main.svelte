<script lang="ts">
  import { isActivePath } from "@/utils";
  import { page } from "$app/state";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import ChevronRight from "lucide-svelte/icons/chevron-right";

  const currentPath = $derived(page.url.pathname);

  const {
    items,
  }: {
    items: {
      title: string;
      url: string;
      icon: any;
      isActive?: boolean;
      items?: {
        title: string;
        url: string;
      }[];
    }[];
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="">Platform</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as mainItem (mainItem.title)}
      <Collapsible.Root open={mainItem.isActive} class="group/collapsible">
        {#snippet child({ props })}
          <Sidebar.MenuItem {...props}>
            <Collapsible.Trigger>
              {#snippet child({ props })}
                <Sidebar.MenuButton
                  {...props}
                  isActive={mainItem.isActive}
                  class="data-[active=true]:font-normal"
                >
                  {#snippet tooltipContent()}
                    {mainItem.title}
                  {/snippet}

                  {#snippet child({ props })}
                    {#if mainItem.items?.length}
                      <a {...props}>
                        {#if mainItem.icon}
                          <mainItem.icon />
                        {/if}

                        <span>{mainItem.title}</span>
                        <ChevronRight
                          class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                        />
                      </a>
                    {:else}
                      <a href={mainItem.url} {...props}>
                        <mainItem.icon />
                        <span>{mainItem.title}</span>
                      </a>
                    {/if}
                  {/snippet}
                </Sidebar.MenuButton>
              {/snippet}
            </Collapsible.Trigger>
            <Collapsible.Content>
              {#if mainItem.items?.length}
                <Sidebar.MenuSub>
                  {#each mainItem.items as subItem (subItem.title)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton
                        href={subItem.url}
                        class="data-[active=true]:text-brand hover:text-brand/80 active:text-brand hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent"
                        isActive={isActivePath(currentPath, subItem.url)}
                      >
                        {#snippet child({ props })}
                          <a href={subItem.url} {...props}>
                            <span>{subItem.title}</span>
                          </a>
                        {/snippet}
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              {/if}
            </Collapsible.Content>
          </Sidebar.MenuItem>
        {/snippet}
      </Collapsible.Root>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
