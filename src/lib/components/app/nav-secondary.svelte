<script lang="ts">
  import type { ComponentProps } from "svelte";

  import * as Sidebar from "$lib/components/ui/sidebar";

  let {
    ref = $bindable(null),
    items,
    ...restProps
  }: {
    items: {
      title: string;
      url: string;
      icon: any;
    }[];
  } & ComponentProps<typeof Sidebar.Group> = $props();
</script>

<Sidebar.Group bind:ref {...restProps}>
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      {#each items as item (item.title)}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton size="sm">
            {#snippet child({ props })}
              <a href={item.url} {...props}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
</Sidebar.Group>
