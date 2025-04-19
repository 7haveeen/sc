<!-- tax-information-form.svelte -->
<script lang="ts">
  import * as Alert from "@/components/ui/alert";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { RadioGroup } from "bits-ui";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  /*
  const taxInformationSchema = z.object({
    vatStatus: z.enum(["vat", "non-vat"]),
    taxId: z.string().optional(),
    vatNumber: z.string().optional(),
    taxDocuments: z.array(z.any()).optional(),
  }); */

  const isEditing = $props();

  let vatStatus = $state("");
  let taxId = $state("");
  let vatNumber = $state("");
  // let taxDocuments = $state<File[]>([]);

  function handleFileUpload(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const input = event.currentTarget;
    if (input.files?.length) {
    // taxDocuments = Array.from(input.files);
    }
  }
</script>

<form method="POST">
  <div class="space-y-6">
    <div class="grid gap-6">
      <div class="space-y-6">
        <Label>VAT Registration Status</Label>
        <RadioGroup.Root
          value={vatStatus}
          onValueChange={value => (vatStatus = value)}
          class="flex flex-col gap-4 md:flex-row md:gap-8"
        >
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="vat" id="vat" disabled={!isEditing}>
              {#snippet children({ checked })}
                {#if checked}
                  <CircleCheck class="text-brand size-4" />
                {/if}
              {/snippet}
            </RadioGroup.Item>
            <Label for="vat" class="font-normal">VAT Registered</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="non-vat" id="non-vat" disabled={!isEditing}>
              {#snippet children({ checked })}
                {#if checked}
                  <CircleCheck class="text-brand size-4" />
                {/if}
              {/snippet}
            </RadioGroup.Item>
            <Label for="non-vat" class="font-normal">Non-VAT Registered</Label>
          </div>
        </RadioGroup.Root>
      </div>

      {#if vatStatus === "vat"}
        <div class="space-y-2">
          <Label for="vat-number">VAT Registration Number</Label>
          <Input
            disabled={!isEditing}
            type="text"
            id="vat-number"
            bind:value={vatNumber}
            placeholder="Enter VAT registration number"
            class="disabled:cursor-default disabled:border-none disabled:p-0"
          />
        </div>
      {/if}

      <div class="space-y-2">
        <Label for="tax-id">Tax ID Number</Label>
        <Input
          disabled={!isEditing}
          type="text"
          id="tax-id"
          bind:value={taxId}
          placeholder="Enter tax ID number"
          class="disabled:cursor-default disabled:border-none disabled:p-0"
        />
      </div>

      <div class="space-y-2">
        <Label>Tax Documents</Label>
        <div class="flex flex-col gap-2">
          <Input
            disabled={!isEditing}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onchange={handleFileUpload}
            multiple
            class="disabled:cursor-not-allowed"
          />
          <p class="text-muted-foreground text-xs">
            Upload Tax Registration Certificate and other relevant documents (PDF, JPG, PNG only)
          </p>
        </div>
      </div>

      {#if isEditing}
        <Alert.Root
          class="rounded-sm border border-dashed border-amber-500 bg-amber-50 p-2 dark:border-amber-900/50 dark:bg-amber-900/30"
        >
          <Alert.Description
            class="flex items-center gap-4 text-pretty text-[0.7rem] text-amber-700 dark:text-amber-400"
          >
            Please ensure all tax information is accurate and up-to-date. Incorrect information may
            result in compliance issues.
          </Alert.Description>
        </Alert.Root>
      {/if}
    </div>
  </div>
</form>
