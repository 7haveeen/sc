<script lang="ts">
  import "../app.css";
  import { remult, Remult } from "remult";
  import { untrack } from "svelte";
  import { createSubscriber } from "svelte/reactivity";
  import { userRune } from "@/stores/runes.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import { ModeWatcher } from "mode-watcher";

  let { data, children } = $props();
  userRune.set(() => data.user);

  $effect(() => {
    data.user;
    untrack(() => {
      remult.user = data.user;
    });
  });

  function initRemultReactivity() {
    const createSub = () => {
      let update = () => {};
      const s = createSubscriber(u => update = u);
      return { obs: () => s(), chg: () => update() };
    };

    {
      const sub = createSub();
      remult.subscribeAuth({
        reportObserved: sub.obs,
        reportChanged: sub.chg,
      });
    }

    Remult.entityRefInit = (x) => {
      const sub = createSub();
      x.subscribe({
        reportObserved: sub.obs,
        reportChanged: sub.chg,
      });
    };
  }
  initRemultReactivity();
</script>

<ModeWatcher />
<Toaster />

{@render children?.()}
