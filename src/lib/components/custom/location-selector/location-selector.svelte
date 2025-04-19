<script lang="ts">
  import Button from "@/components/ui/button/button.svelte";
  import { cn } from "@/utils";
  import { Combobox } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";

  type Location = { id: string; name: string };
  type City = Location & { locations: Location[] };
  type Province = Location & { cities: City[] };
  type ZimbabweData = { provinces: Province[] };

  type LocationValue = {
    province?: string;
    city?: string;
    location?: string;
  };

  type Props = {
    value?: LocationValue;
    onChange?: (location: LocationValue) => void;
    disabled?: boolean;
    locations?: ZimbabweData;
  };

  let { value, onChange, disabled = false, locations }: Props = $props();

  if (!locations) {
    locations = {
      provinces: [
        {
          id: "harare",
          name: "Harare",
          cities: [
            {
              id: "harare",
              name: "Harare",
              locations: [
                // Central Business District
                { id: "cbd", name: "CBD" },
                { id: "avenues", name: "Avenues" },
                { id: "milton-park", name: "Milton Park" },
                { id: "belgravia", name: "Belgravia" },

                // Northern Suburbs
                { id: "borrowdale", name: "Borrowdale / Borrowdale Brooke" },
                { id: "highlands", name: "Highlands / Mt Pleasant" },
                { id: "chisipite", name: "Chisipite / Colne Valley" },
                { id: "greendale", name: "Greendale / Greystone Park" },
                { id: "glen-lorne", name: "Glen Lorne / Umwinsidale" },
                { id: "mandara", name: "Mandara / Shawasha Hills" },

                // Eastern Suburbs
                { id: "eastlea", name: "Eastlea / Newlands" },
                { id: "hillside", name: "Hillside / Braeside" },
                { id: "hatfield", name: "Hatfield / Chadcombe" },
                { id: "cranborne", name: "Cranborne / Queensdale" },

                // Southern Suburbs
                { id: "waterfalls", name: "Waterfalls" },
                { id: "prospect", name: "Prospect / Arcadia" },
                { id: "houghton-park", name: "Houghton Park / Parktown" },

                // Western Suburbs
                { id: "avondale", name: "Avondale / Strathaven" },
                { id: "westgate", name: "Westgate / Bluff Hill" },
                { id: "mabelreign", name: "Mabelreign / Marlborough" },
                { id: "ashdown-park", name: "Ashdown Park / Tynwald" },

                // High Density Areas - Eastern
                { id: "mabvuku", name: "Mabvuku / Tafara" },
                { id: "epworth", name: "Epworth" },

                // High Density Areas - Western/Southern
                { id: "mbare", name: "Mbare" },
                { id: "highfield", name: "Highfield / Lusaka" },
                { id: "glen-view", name: "Glen View / Glen Norah" },
                { id: "budiriro", name: "Budiriro / Glenwood" },
                { id: "kuwadzana", name: "Kuwadzana / Warren Park" },
                { id: "dzivarasekwa", name: "Dzivarasekwa" },
                { id: "mufakose", name: "Mufakose / Marimba" },
                { id: "kambuzuma", name: "Kambuzuma / Rugare" },

                // Industrial Areas
                { id: "msasa", name: "Msasa / Graniteside" },
                { id: "southerton", name: "Southerton / Workington" },
                { id: "willowvale", name: "Willowvale / Ardbennie" },

                // Northern Outskirts
                { id: "hatcliffe", name: "Hatcliffe / Pomona" },

                // Other
                { id: "other", name: "Other" },
              ],
            },
            {
              id: "chitungwiza",
              name: "Chitungwiza",
              locations: [
                { id: "zengeza", name: "Zengeza" },
                { id: "st-marys", name: "St Mary's" },
                { id: "seke", name: "Seke" },
                { id: "makoni", name: "Makoni" },
              ],
            },
          ],
        },
        {
          id: "bulawayo",
          name: "Bulawayo",
          cities: [
            {
              id: "bulawayo-city",
              name: "Bulawayo City",
              locations: [
                { id: "suburbs", name: "Suburbs" },
                { id: "queenspark", name: "Queens Park" },
                { id: "hillside", name: "Hillside" },
                { id: "northend", name: "North End" },
                { id: "belmont", name: "Belmont" },
              ],
            },
          ],
        },
        {
          id: "manicaland",
          name: "Manicaland",
          cities: [
            {
              id: "mutare",
              name: "Mutare",
              locations: [
                { id: "dangamvura", name: "Dangamvura" },
                { id: "chikanga", name: "Chikanga" },
                { id: "sakubva", name: "Sakubva" },
              ],
            },
            {
              id: "rusape",
              name: "Rusape",
              locations: [
                { id: "vengere", name: "Vengere" },
                { id: "tsanzaguru", name: "Tsanzaguru" },
              ],
            },
          ],
        },
        {
          id: "midlands",
          name: "Midlands",
          cities: [
            {
              id: "gweru",
              name: "Gweru",
              locations: [
                { id: "mkoba", name: "Mkoba" },
                { id: "senga", name: "Senga" },
                { id: "mambo", name: "Mambo" },
              ],
            },
            {
              id: "kwekwe",
              name: "Kwekwe",
              locations: [
                { id: "amaveni", name: "Amaveni" },
                { id: "mbizo", name: "Mbizo" },
              ],
            },
          ],
        },
        {
          id: "mashonaland-east",
          name: "Mashonaland East",
          cities: [
            {
              id: "marondera",
              name: "Marondera",
              locations: [
                { id: "cherutombo", name: "Cherutombo" },
                { id: "dombotombo", name: "Dombotombo" },
              ],
            },
          ],
        },
        {
          id: "mashonaland-west",
          name: "Mashonaland West",
          cities: [
            {
              id: "chinhoyi",
              name: "Chinhoyi",
              locations: [
                { id: "chikonohono", name: "Chikonohono" },
                { id: "cold-stream", name: "Cold Stream" },
              ],
            },
          ],
        },
        {
          id: "mashonaland-central",
          name: "Mashonaland Central",
          cities: [
            {
              id: "bindura",
              name: "Bindura",
              locations: [
                { id: "chipadze", name: "Chipadze" },
                { id: "chiwaridzo", name: "Chiwaridzo" },
              ],
            },
          ],
        },
        {
          id: "masvingo",
          name: "Masvingo",
          cities: [
            {
              id: "masvingo-city",
              name: "Masvingo City",
              locations: [
                { id: "mucheke", name: "Mucheke" },
                { id: "rujeko", name: "Rujeko" },
              ],
            },
          ],
        },
        {
          id: "matabeleland-north",
          name: "Matabeleland North",
          cities: [
            {
              id: "victoria-falls",
              name: "Victoria Falls",
              locations: [
                { id: "chinotimba", name: "Chinotimba" },
                { id: "mkhosana", name: "Mkhosana" },
              ],
            },
          ],
        },
        {
          id: "matabeleland-south",
          name: "Matabeleland South",
          cities: [
            {
              id: "gwanda",
              name: "Gwanda",
              locations: [
                { id: "jahunda", name: "Jahunda" },
                { id: "spitzkop", name: "Spitzkop" },
              ],
            },
          ],
        },
      ],
    };
  }

  type Step = "province" | "city" | "location";

  let open = $state(false);
  let searchValue = $state("");
  let selectedProvince = $state(value?.province ?? "");
  let selectedCity = $state(value?.city ?? "");
  let selectedLocation = $state(value?.location ?? "");
  let step = $state<Step>("province");

  // Update selections when value prop changes
  $effect(() => {
    if (value) {
      selectedProvince = value.province ?? "";
      selectedCity = value.city ?? "";
      selectedLocation = value.location ?? "";
    }
  });

  // Formatted display value
  const displayValue = $derived(
    [selectedProvince, selectedCity, selectedLocation].filter(Boolean).join(" / ") || "",
  );

  // Handle selection at each step and navigate to next step
  function handleSelect(selectedValue: string) {
    switch (step) {
      case "province":
        selectedProvince = selectedValue;
        selectedCity = "";
        selectedLocation = "";
        step = "city";
        clearSearch();
        break;
      case "city":
        selectedCity = selectedValue;
        selectedLocation = "";
        step = "location";
        clearSearch();
        break;
      case "location":
        selectedLocation = selectedValue;
        open = false;
        onChange?.({
          province: selectedProvince,
          city: selectedCity,
          location: selectedValue,
        });
        clearSearch();
        break;
    }
  }

  // Get options for the current selection step
  function getCurrentOptions() {
    if (!locations)
      return [];

    switch (step) {
      case "province":
        return locations.provinces.map(province => ({
          value: province.name,
          label: province.name,
        }));
      case "city": {
        const province = locations.provinces.find(p => p.name === selectedProvince);
        return (
          province?.cities.map(city => ({
            value: city.name,
            label: city.name,
          })) ?? []
        );
      }
      case "location": {
        const province = locations.provinces.find(p => p.name === selectedProvince);
        const city = province?.cities.find(c => c.name === selectedCity);
        return (
          city?.locations.map(location => ({
            value: location.name,
            label: location.name,
          })) ?? []
        );
      }
      default:
        return [];
    }
  }

  // Memoized filtered options
  const filteredOptions = $derived(
    searchValue === ""
      ? getCurrentOptions()
      : getCurrentOptions().filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()),
      ),
  );

  // Check if a step is accessible based on previous selections
  function isStepAccessible(stepName: Step): boolean {
    switch (stepName) {
      case "province":
        return true;
      case "city":
        return !!selectedProvince;
      case "location":
        return !!selectedProvince && !!selectedCity;
      default:
        return false;
    }
  }

  // Step configuration
  const tabs = [
    { name: "province" as const, label: "Province" },
    { name: "city" as const, label: "Town/City" },
    { name: "location" as const, label: "Location" },
  ];

  // Clear search input
  function clearSearch() {
    searchValue = "";
  }
</script>

<Combobox.Root
  type="multiple"
  name="locationSelector"
  bind:open
  onOpenChange={(o) => {
    if (!o)
      searchValue = "";
  }}
>
  <div class="relative">
    <Combobox.Input>
      {#snippet child({ props })}
        <input
          {...props}
          readonly
          value={displayValue}
          class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full cursor-pointer rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 md:text-sm"
          placeholder="Select location"
          aria-label="Select Business location"
          {disabled}
          onclick={() => (open = !open)}
        />
      {/snippet}
    </Combobox.Input>
    <Combobox.Trigger class="absolute end-3 top-1/2 -translate-y-1/2">
      <ChevronDown class="text-muted-foreground size-4" />
    </Combobox.Trigger>
  </div>
  <Combobox.Portal>
    <Combobox.Content
      class="border-muted bg-popover shadow-popover max-h-[calc(90vh-4rem)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-md border p-1"
      sideOffset={8}
    >
      <div class="bg-background sticky top-0 z-10 mb-2 flex overflow-clip rounded-sm">
        {#each tabs as tab}
          <Button
            variant="ghost"
            onclick={() => {
              if (isStepAccessible(tab.name)) {
                step = tab.name;
                clearSearch();
              }
            }}
            class={cn(
              "h-8 flex-1 rounded-none text-center text-xs font-medium transition-all duration-200",
              step === tab.name ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground",
              isStepAccessible(tab.name)
                ? "hover:bg-muted hover:text-foreground cursor-pointer"
                : "opacity-40",
            )}
          >
            {tab.label}
          </Button>
        {/each}
      </div>

      <div class="bg-muted/30 sticky top-11 z-10 px-1 py-1">
        <input
          type="text"
          placeholder="Search..."
          class="border-input placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
          bind:value={searchValue}
        />
      </div>

      <Combobox.Viewport class="mt-1">
        {#if filteredOptions.length > 0}
          <div class="flex flex-wrap gap-1.5 p-1">
            {#each filteredOptions as ctx (ctx.value)}
              <Combobox.Item
                class="hover:bg-muted hover:text-brand border-border/30 bg-background flex items-center rounded-full border px-2 py-1.5 text-xs transition-colors"
                value={ctx.value}
                label={ctx.label}
                onclick={() => handleSelect(ctx.value)}
              >
                {ctx.label}
              </Combobox.Item>
            {/each}
          </div>
        {:else}
          <div class="flex justify-center py-4">
            <span class="text-muted-foreground text-xs">
              No {step} found
            </span>
          </div>
        {/if}

        {#if step === "province"}
          <div class="border-border/40 mt-3 space-y-2 border-t p-2">
            <p class="text-muted-foreground text-[10px]">Popular provinces</p>
            <div class="flex flex-wrap gap-1">
              {#each ["Harare", "Bulawayo", "Manicaland"].map(name => ({ value: name, label: name })) as item}
                <Button
                  variant="outline"
                  class="h-6 rounded-full px-2 text-[0.7rem]"
                  onclick={() => handleSelect(item.value)}
                >
                  {item.label}
                </Button>
              {/each}
            </div>
          </div>
        {/if}
      </Combobox.Viewport>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
