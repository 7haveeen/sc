<script lang="ts">
  import { LocationSelector } from "@/components/custom/location-selector";
  import * as Alert from "@/components/ui/alert";
  import Button from "@/components/ui/button/button.svelte";
  import * as Card from "@/components/ui/card";
  import * as Form from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import * as Select from "@/components/ui/select";
  import { route } from "@/ROUTES";
  import { invalidateAll } from "$app/navigation";
  import { RadioGroup } from "bits-ui";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import CloudUploadIcon from "lucide-svelte/icons/cloud-upload";
  import DownloadIcon from "lucide-svelte/icons/download";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import { FileUpload } from "melt/builders";
  import { toast } from "svelte-sonner";
  import { SvelteSet } from "svelte/reactivity";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms/client";
  import { businessInfoSchema } from "../dto/business-reg-schema";
  import { getters } from "melt";

  import type { PageData } from "../$types";

  const controls = {
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    accept: ".jpg, .jpeg, .png, .pdf",
  };

  const idTypes = [
    { value: "passport", label: "Passport" },
    { value: "identity_card", label: "Identity Card" },
  ] as const;

  const {
    data,
  }: {
    data: PageData;
  } = $props();

  let isEditing = $state(false);

  const form = superForm(data.businessInfoForm, {
    dataType: "json",
    validators: zodClient(businessInfoSchema),
    onUpdate: ({ form }) => {
      if (!form.valid && isEditing) {
        toast.error("Please fix the validation errors");
      }
    },
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success("Business Information updated successfully");
        invalidateAll();
        isEditing = false;
      }
    },
    onError: () => {
      toast.error("Failed to update business information", {
        description: "Please try again later...",
      });
    },
  });

  const { form: formData, enhance, submitting } = form;

  const fileUpload = new FileUpload({
    ...getters(controls),
    selected: [],
    onError: (e) => {
      if (e.type === "size") {
        toast.error("File too large", {
          description: `File exceed max allowed size of ${formatFileSize(controls.maxSize)}`,
        });
      }
      if (e.type === "type") {
        toast.error("Unsupported file type", {
          description: `File type is not supported, use only${controls.accept}`,
        });
      }
    },
  });

  function formatFileSize(bytes: number) {
    if (bytes === 0)
      return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  const files = $derived.by(() => {
    if (fileUpload.selected instanceof SvelteSet) {
      return Array.from(fileUpload.selected);
    }
    return [fileUpload.selected].filter((f): f is File => !!f);
  });

  const idType = $derived(
    idTypes.find(ctx => ctx.value === $formData.idDocument.type)?.label ?? "Select ID type",
  );
</script>

<form method="POST" use:enhance action={route("updateBusinessInfo /settings/shop")}>
  <div class="space-y-6">
    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="mb-4 md:col-span-2">
          <Form.Fieldset {form} name="businessType" class="space-y-3">
            <div class="flex items-center justify-between">
              <Form.Legend class="text-sm font-medium">Business Type</Form.Legend>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="text-muted-foreground hover:text-foreground flex items-center gap-2"
                onclick={() => {
                  if (isEditing) {
                    form.reset();
                  }
                  isEditing = !isEditing;
                }}
                disabled={$submitting}
              >
                <PencilIcon class="size-4" />
                <span>{isEditing ? "Cancel" : "Edit"}</span>
              </Button>
            </div>
            <RadioGroup.Root
              bind:value={$formData.businessType}
              class="flex flex-col gap-4 md:flex-row md:gap-8"
              name="businessType"
            >
              <div class="flex items-center space-x-3">
                <Form.Control>
                  {#snippet children({ props })}
                    <RadioGroup.Item value="individual" {...props} disabled={!isEditing}>
                      {#if $formData.businessType === "individual"}
                        <CircleCheck class="text-brand size-4" />
                      {/if}
                    </RadioGroup.Item>
                    <Form.Label class="font-normal">Individual</Form.Label>
                  {/snippet}
                </Form.Control>
              </div>
              <div class="flex items-center space-x-3 space-y-0">
                <Form.Control>
                  {#snippet children({ props })}
                    <RadioGroup.Item value="corporate" {...props} disabled={!isEditing}>
                      {#if $formData.businessType === "corporate"}
                        <CircleCheck class="text-brand size-4" />
                      {/if}
                    </RadioGroup.Item>
                    <Form.Label class="font-normal">Corporate</Form.Label>
                  {/snippet}
                </Form.Control>
              </div>
            </RadioGroup.Root>
            <Form.FieldErrors class="text-[0.7rem]" />
            <Form.Description class="text-[0.7rem]">
              An individual account is typically for a single person managing their own business,
              while a corporate account is designed for businesses that operate as a legal entity,
              often involving multiple stakeholders.
            </Form.Description>
          </Form.Fieldset>
        </div>

        {#if $formData.businessType === "individual"}
          <!-- Business Information for Individual -->
          <div class="md:col-span-2">
            <Card.Root class="bg-card/50 border shadow-sm">
              <Card.Header>
                <Card.Title class="text-base font-medium">Company information</Card.Title>
                <Card.Description class="text-xs">
                  Provide details about your business operations
                </Card.Description>
              </Card.Header>
              <Card.Content class="grid gap-6 p-6">
                <div class="grid gap-6 sm:grid-cols-2">
                  <Form.Field {form} name="businessName" class="space-y-2">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label class="data-[fs-error]:text-foreground"
                        >Business/Trade Name</Form.Label
                        >
                        <div class="relative">
                          <Input
                            {...props}
                            disabled={!isEditing}
                            bind:value={$formData.businessName}
                            maxlength={30}
                            placeholder="Enter business name"
                            autocomplete="organization"
                            class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                              ? "pr-12"
                              : ""}"
                          />
                          {#if isEditing}
                            <span
                              class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                            >
                              {$formData.businessName?.length ?? 0}/30
                            </span>
                          {/if}
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]"
                    >The name under which you conduct business</Form.Description
                    >
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>

                  <Form.Field {form} name="generalLocation" class="space-y-2">
                    <Form.Control>
                      {#snippet children()}
                        <Form.Label class="data-[fs-error]:text-foreground">
                          General Location
                        </Form.Label>
                        <LocationSelector />
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]">
                      Your primary business location or area of operation
                    </Form.Description>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
          <!-- Owner Information for Individual -->
          <div class="md:col-span-2">
            <Card.Root class="bg-card/50 border shadow-sm transition-all duration-200">
              <Card.Header>
                <div class="space-y-1">
                  <Card.Title class="text-base font-semibold tracking-tight"
                  >Owner Information</Card.Title
                  >
                  <Card.Description class="text-muted-foreground/90 text-xs">
                    Provide your personal details for business verification
                  </Card.Description>
                </div>
              </Card.Header>
              <Card.Content class="p-6">
                <div class="space-y-8">
                  <!-- Personal Information Section -->
                  <div class="space-y-5">
                    <div class="grid gap-6 sm:grid-cols-3">
                      <Form.Field {form} name="ownerInfo.lastName" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Last Name
                            </Form.Label>
                            <div class="relative">
                              <Input
                                {...props}
                                disabled={!isEditing}
                                bind:value={$formData.ownerInfo.lastName}
                                maxlength={30}
                                placeholder="Enter last name"
                                autocomplete="family-name"
                                class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                                  ? "pr-12"
                                  : ""}"
                              />
                              {#if isEditing}
                                <span
                                  class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                >
                                  {$formData.ownerInfo.lastName?.length ?? 0}/30
                                </span>
                              {/if}
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>

                      <Form.Field {form} name="ownerInfo.firstName" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              First Name
                            </Form.Label>
                            <div class="relative">
                              <Input
                                {...props}
                                disabled={!isEditing}
                                bind:value={$formData.ownerInfo.firstName}
                                maxlength={30}
                                placeholder="Enter first name"
                                autocomplete="given-name"
                                class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                                  ? "pr-12"
                                  : ""}"
                              />
                              {#if isEditing}
                                <span
                                  class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                >
                                  {$formData.ownerInfo.firstName?.length ?? 0}/30
                                </span>
                              {/if}
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>

                      <Form.Field {form} name="ownerInfo.middleName" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Middle Name
                            </Form.Label>
                            <div class="relative">
                              <Input
                                {...props}
                                disabled={!isEditing}
                                bind:value={$formData.ownerInfo.middleName}
                                maxlength={30}
                                placeholder="Enter middle name"
                                autocomplete="off"
                                class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                                  ? "pr-12"
                                  : ""}"
                              />
                              {#if isEditing}
                                <span
                                  class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                >
                                  {$formData.ownerInfo.middleName?.length ?? 0}/30
                                </span>
                              {/if}
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>
                    </div>
                  </div>

                  <!-- Contact & Verification Section -->
                  <div class="space-y-5">
                    <div class="grid gap-6 sm:grid-cols-2">
                      <Form.Field {form} name="ownerInfo.residentialAddress" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Residential Address
                            </Form.Label>
                            <Input
                              {...props}
                              disabled={!isEditing}
                              bind:value={$formData.ownerInfo.residentialAddress}
                              placeholder="Enter residential address"
                              autocomplete="off"
                              class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0"
                            />
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>
                      <Form.Field {form} name="idDocument.type" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Government ID Type
                            </Form.Label>
                            <Select.Root
                              type="single"
                              bind:value={$formData.idDocument.type}
                              disabled={!isEditing}
                              name={props.name}
                            >
                              <Select.Trigger
                                {...props}
                                class="w-full {!isEditing ? "border-none pl-0" : ""}"
                                aria-label="Select ID type"
                              >
                                {#if $formData.idDocument.type}
                                  {idType}
                                {:else}
                                  Select ID type
                                {/if}
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Group>
                                  {#each idTypes as type}
                                    <Select.Item value={type.value} label={type.label} />
                                  {/each}
                                </Select.Group>
                              </Select.Content>
                            </Select.Root>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>
                    </div>
                  </div>

                  <!-- Document Upload Section -->
                  {#if isEditing}
                    <div class="space-y-5">
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm font-medium">Upload ID</h3>
                        <div class="bg-border/60 h-px flex-1"></div>
                        <span class="text-muted-foreground text-[0.7rem] font-medium"
                        >{files.length}/2 files</span
                        >
                      </div>
                      <div class="flex flex-wrap items-start gap-4">
                        {#each files.slice(0, 2) as file}
                          <div
                            class="bg-muted group relative size-24 overflow-hidden rounded-lg border"
                          >
                            {#if file.type === "application/pdf"}
                              <div class="bg-muted flex h-full w-full items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="size-12"
                                  viewBox="0 0 303.188 303.188"
                                ><path
                                  d="M219.821 0H32.842v303.188h237.504V50.525z"
                                  fill="#e8e8e8"
                                /><path
                                  d="M230.013 149.935c-3.643-6.493-16.231-8.533-22.006-9.451-4.552-.724-9.199-.94-13.803-.936-3.615-.024-7.177.154-10.693.354l-3.861.31c-1.314-1.36-2.584-2.765-3.813-4.202-7.82-9.257-14.134-19.755-19.279-30.664 1.366-5.271 2.459-10.772 3.119-16.485 1.205-10.427 1.619-22.31-2.288-32.251-1.349-3.431-4.946-7.608-9.096-5.528-4.771 2.392-6.113 9.169-6.502 13.973-.313 3.883-.094 7.776.558 11.594.664 3.844 1.733 7.494 2.897 11.139 1.086 3.342 2.283 6.658 3.588 9.943-.828 2.586-1.707 5.127-2.63 7.603-2.152 5.643-4.479 11.004-6.717 16.161l-3.465 7.507c-3.576 7.855-7.458 15.566-11.815 23.02-10.163 3.585-19.283 7.741-26.857 12.625-4.063 2.625-7.652 5.476-10.641 8.603-2.822 2.952-5.69 6.783-5.941 11.024-.141 2.394.807 4.717 2.768 6.137 2.697 2.015 6.271 1.881 9.4 1.225 10.25-2.15 18.121-10.961 24.824-18.387 4.617-5.115 9.872-11.61 15.369-19.465l.037-.054c9.428-2.923 19.689-5.391 30.579-7.205 4.975-.825 10.082-1.5 15.291-1.974 3.663 3.431 7.621 6.555 11.939 9.164 3.363 2.069 6.94 3.816 10.684 5.119 3.786 1.237 7.595 2.247 11.528 2.886 1.986.284 4.017.413 6.092.335 4.631-.175 11.278-1.951 11.714-7.57.134-1.72-.237-3.228-.98-4.55zm-110.869 10.31c-2.169 3.36-4.261 6.382-6.232 9.041-4.827 6.568-10.34 14.369-18.322 17.286-1.516.554-3.512 1.126-5.616 1.002-1.874-.11-3.722-.937-3.637-3.065.042-1.114.587-2.535 1.423-3.931.915-1.531 2.048-2.935 3.275-4.226 2.629-2.762 5.953-5.439 9.777-7.918 5.865-3.805 12.867-7.23 20.672-10.286l-1.34 2.097zm27.222-84.26a38.17 38.17 0 0 1-.323-10.503c.184-1.713.533-3.385 1.038-4.952.428-1.33 1.352-4.576 2.826-4.993 2.43-.688 3.177 4.529 3.452 6.005 1.566 8.396.186 17.733-1.693 25.969a113.51 113.51 0 0 1-.973 3.883 121.22 121.22 0 0 1-1.648-4.821c-1.1-3.525-2.106-7.091-2.679-10.588zm16.683 66.28c-9.13 1.48-17.815 3.419-25.979 5.708.983-.275 5.475-8.788 6.477-10.555 4.721-8.315 8.583-17.042 11.358-26.197 4.9 9.691 10.847 18.962 18.153 27.214a104.71 104.71 0 0 0 2.053 2.22 235.27 235.27 0 0 0-12.062 1.61zm61.744 11.694c-.334 1.805-4.189 2.837-5.988 3.121-5.316.836-10.94.167-16.028-1.542-3.491-1.172-6.858-2.768-10.057-4.688-3.18-1.921-6.155-4.181-8.936-6.673 3.429-.206 6.9-.341 10.388-.275 3.488.035 7.003.211 10.475.664 6.511.726 13.807 2.961 18.932 7.186 1.009.833 1.331 1.569 1.214 2.207zm2.847-128.696H32.842V0h186.979z"
                                  fill="#fb3449"
                                /><path
                                  d="M126.841 241.152c0 5.361-1.58 9.501-4.742 12.421s-7.652 4.381-13.472 4.381h-3.643v15.917H92.022v-47.979h16.606c6.06 0 10.611 1.324 13.652 3.971s4.561 6.41 4.561 11.289zm-21.856 6.235h2.363c1.947 0 3.495-.546 4.644-1.641s1.723-2.604 1.723-4.529c0-3.238-1.794-4.857-5.382-4.857h-3.348v11.027zm70.23 1.477c0 8.007-2.205 14.177-6.613 18.509s-10.606 6.498-18.591 6.498h-15.523v-47.979h16.606c7.701 0 13.646 1.969 17.836 5.907s6.285 9.627 6.285 17.065zm-13.455.46c0-4.398-.87-7.657-2.609-9.78s-4.381-3.183-7.926-3.183h-3.773v26.877h2.888c3.939 0 6.826-1.143 8.664-3.43s2.756-5.78 2.756-10.484zm34.819 24.547h-12.766v-47.979h28.355v10.403h-15.589v9.156h14.374v10.403h-14.374v18.017h0z"
                                  fill="#a4a9ad"
                                /><path
                                  d="M219.821 50.525h50.525L219.821 0z"
                                  fill="#d1d3d3"
                                /></svg
                                >
                              </div>
                            {:else}
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                class="h-full w-full object-cover"
                              />
                            {/if}
                            <div
                              class="absolute bottom-0 left-0 right-0 flex h-auto items-center justify-between bg-black/60 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Button
                                variant="ghost"
                                class="flex size-6 items-center justify-center rounded-sm p-1 text-white"
                                onclick={() => {
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(file);
                                  link.download = file.name;
                                  link.click();
                                }}
                              >
                                <DownloadIcon class="size-4" />
                              </Button>
                              <div class="h-4 w-[1px] bg-white/40"></div>
                              <Button
                                variant="ghost"
                                class="flex size-6 items-center justify-center rounded-sm p-1 text-white"
                                onclick={() => {
                                  fileUpload.remove(file);
                                }}
                              >
                                <TrashIcon class="size-4" />
                              </Button>
                            </div>
                          </div>
                        {/each}
                        {#if files.length < 2}
                          <div
                            class="bg-muted/30 hover:bg-muted/50 border-muted-foreground/20 hover:border-brand/30 size-24 overflow-hidden rounded-lg border-2 border-dashed transition-all"
                          >
                            <input {...fileUpload.input} />
                            <div
                              {...fileUpload.dropzone}
                              class="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                            >
                              {#if fileUpload.isDragging}
                                <p class="text-brand text-xs font-medium">Drop here</p>
                              {:else}
                                <CloudUploadIcon class="text-muted-foreground/70 mb-1.5 size-6" />
                                <p class="text-muted-foreground/70 text-[0.7rem]">Upload File</p>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      </div>
                      <p class="text-muted-foreground text-[0.7rem]">
                        Supported formats: JPG, JPEG, PNG, PDF • Maximum size: 5MB
                      </p>
                    </div>
                  {/if}
                </div>
              </Card.Content>
            </Card.Root>
          </div>

          <!-- <SuperDebug data={$formData} /> -->
        {:else}
          <!-- Business Information for Corporate -->
          <div class="md:col-span-2">
            <Card.Root class="bg-card/50 border shadow-sm">
              <Card.Header>
                <Card.Title class="text-base font-medium">Company Information</Card.Title>
                <Card.Description class="text-xs">
                  Provide details about your corporate business entity
                </Card.Description>
              </Card.Header>
              <Card.Content class="grid gap-6 p-6">
                <div class="grid gap-6 sm:grid-cols-2">
                  <Form.Field {form} name="businessName" class="space-y-2.5">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label class="data-[fs-error]:text-foreground"
                        >Company Registered Name</Form.Label
                        >
                        <div class="relative">
                          <Input
                            {...props}
                            disabled={!isEditing}
                            bind:value={$formData.businessName}
                            maxlength={30}
                            placeholder="Enter business name"
                            autocomplete="organization"
                            class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                              ? "pr-12"
                              : ""}"
                          />
                          {#if isEditing}
                            <span
                              class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                            >
                              {$formData.businessName?.length ?? 0}/30
                            </span>
                          {/if}
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]">
                      Company Registered Name is your business's official designation, recorded with
                      government authorities for legal, tax, and formal transactions.
                    </Form.Description>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>
                  <Form.Field {form} name="registeredName" class="space-y-2.5">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label class="data-[fs-error]:text-foreground"
                        >Business Name/Trade Name</Form.Label
                        >
                        <div class="relative">
                          <Input
                            {...props}
                            disabled={!isEditing}
                            bind:value={$formData.registeredName}
                            maxlength={30}
                            placeholder="Enter registered name"
                            autocomplete="off"
                            class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                              ? "pr-12"
                              : ""}"
                          />
                          {#if isEditing}
                            <span
                              class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                            >
                              {$formData.registeredName?.length ?? 0}/30
                            </span>
                          {/if}
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]">
                      Officially registered trade name of your corporate entity
                    </Form.Description>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>
                  <Form.Field {form} name="generalLocation" class="space-y-2.5">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label class="data-[fs-error]:text-foreground"
                        >General Location</Form.Label
                        >
                        <div class="relative">
                          <Input
                            {...props}
                            disabled={!isEditing}
                            bind:value={$formData.generalLocation}
                            maxlength={50}
                            placeholder="Enter general location"
                            autocomplete="off"
                            class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                              ? "pr-12"
                              : ""}"
                          />
                          {#if isEditing}
                            <span
                              class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                            >
                              {$formData.generalLocation?.length ?? 0}/50
                            </span>
                          {/if}
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]">
                      Primary business location or area of operation
                    </Form.Description>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>
                  <Form.Field {form} name="registrationNumber" class="space-y-2.5">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label class="data-[fs-error]:text-foreground"
                        >Business Registration Number</Form.Label
                        >
                        <div class="relative">
                          <Input
                            {...props}
                            disabled={!isEditing}
                            bind:value={$formData.registrationNumber}
                            maxlength={20}
                            placeholder="Enter registration number"
                            autocomplete="off"
                            class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                              ? "pr-12"
                              : ""}"
                          />
                          {#if isEditing}
                            <span
                              class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                            >
                              {$formData.registrationNumber?.length ?? 0}/20
                            </span>
                          {/if}
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]">
                      Official registration number of your corporate entity
                    </Form.Description>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>
                  <Form.Field {form} name="registeredAddress" class="space-y-2.5 md:col-span-2">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label class="data-[fs-error]:text-foreground"
                        >Registered Address</Form.Label
                        >
                        <div class="relative">
                          <Input
                            {...props}
                            disabled={!isEditing}
                            bind:value={$formData.registeredAddress}
                            maxlength={100}
                            placeholder="Enter registered address"
                            autocomplete="off"
                            class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                              ? "pr-12"
                              : ""}"
                          />
                          {#if isEditing}
                            <span
                              class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                            >
                              {$formData.registeredAddress?.length ?? 0}/100
                            </span>
                          {/if}
                        </div>
                      {/snippet}
                    </Form.Control>
                    <Form.Description class="text-[0.7rem]">
                      Official registered address of your corporate entity
                    </Form.Description>
                    <Form.FieldErrors class="text-[0.7rem]" />
                  </Form.Field>
                </div>
              </Card.Content>
            </Card.Root>
          </div>

          <!-- Owner Information for Corporate -->
          <div class="md:col-span-2">
            <Card.Root class="bg-card/50 border shadow-sm transition-all duration-200">
              <Card.Header>
                <div class="space-y-1">
                  <Card.Title class="text-base font-semibold tracking-tight"
                  >Owner Information</Card.Title
                  >
                  <Card.Description class="text-muted-foreground/90 text-xs">
                    Provide your personal details for business verification
                  </Card.Description>
                </div>
              </Card.Header>
              <Card.Content class="p-6">
                <div class="space-y-8">
                  <!-- Personal Information Section -->
                  <div class="space-y-5">
                    <div class="grid gap-6 sm:grid-cols-3">
                      <Form.Field {form} name="ownerInfo.lastName" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Last Name
                            </Form.Label>
                            <div class="relative">
                              <Input
                                {...props}
                                disabled={!isEditing}
                                bind:value={$formData.ownerInfo.lastName}
                                maxlength={30}
                                placeholder="Enter last name"
                                autocomplete="family-name"
                                class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                                  ? "pr-12"
                                  : ""}"
                              />
                              {#if isEditing}
                                <span
                                  class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                >
                                  {$formData.ownerInfo.lastName?.length ?? 0}/30
                                </span>
                              {/if}
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>

                      <Form.Field {form} name="ownerInfo.firstName" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              First Name
                            </Form.Label>
                            <div class="relative">
                              <Input
                                {...props}
                                disabled={!isEditing}
                                bind:value={$formData.ownerInfo.firstName}
                                maxlength={30}
                                placeholder="Enter first name"
                                autocomplete="given-name"
                                class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                                  ? "pr-12"
                                  : ""}"
                              />
                              {#if isEditing}
                                <span
                                  class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                >
                                  {$formData.ownerInfo.firstName?.length ?? 0}/30
                                </span>
                              {/if}
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>

                      <Form.Field {form} name="ownerInfo.middleName" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Middle Name
                            </Form.Label>
                            <div class="relative">
                              <Input
                                {...props}
                                disabled={!isEditing}
                                bind:value={$formData.ownerInfo.middleName}
                                maxlength={30}
                                placeholder="Enter middle name"
                                autocomplete="off"
                                class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0 {isEditing
                                  ? "pr-12"
                                  : ""}"
                              />
                              {#if isEditing}
                                <span
                                  class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                >
                                  {$formData.ownerInfo.middleName?.length ?? 0}/30
                                </span>
                              {/if}
                            </div>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>
                    </div>
                  </div>

                  <!-- Contact & Verification Section -->
                  <div class="space-y-5">
                    <div class="grid gap-6 sm:grid-cols-2">
                      <Form.Field {form} name="ownerInfo.residentialAddress" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Residential Address
                            </Form.Label>
                            <Input
                              {...props}
                              disabled={!isEditing}
                              bind:value={$formData.ownerInfo.residentialAddress}
                              placeholder="Enter residential address"
                              autocomplete="off"
                              class="disabled:cursor-default disabled:border-none disabled:bg-transparent disabled:p-0"
                            />
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>
                      <Form.Field {form} name="idDocument.type" class="space-y-2.5">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label class="data-[fs-error]:text-foreground">
                              Government ID Type
                            </Form.Label>
                            <Select.Root
                              type="single"
                              bind:value={$formData.idDocument.type}
                              disabled={!isEditing}
                              name={props.name}
                            >
                              <Select.Trigger
                                {...props}
                                class="w-full {!isEditing ? "border-none pl-0" : ""}"
                                aria-label="Select ID type"
                              >
                                {#if $formData.idDocument.type}
                                  {idType}
                                {:else}
                                  Select ID type
                                {/if}
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Group>
                                  {#each idTypes as type}
                                    <Select.Item value={type.value} label={type.label} />
                                  {/each}
                                </Select.Group>
                              </Select.Content>
                            </Select.Root>
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors class="text-[0.7rem]" />
                      </Form.Field>
                    </div>
                  </div>

                  <!-- Document Upload Section -->
                  {#if isEditing}
                    <div class="space-y-5">
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm font-medium">Upload ID</h3>
                        <div class="bg-border/60 h-px flex-1"></div>
                        <span class="text-muted-foreground text-[0.7rem] font-medium"
                        >{files.length}/2 files</span
                        >
                      </div>
                      <div class="flex flex-wrap items-start gap-4">
                        {#each files.slice(0, 2) as file}
                          <div
                            class="bg-muted group relative size-24 overflow-hidden rounded-lg border"
                          >
                            {#if file.type === "application/pdf"}
                              <div class="bg-muted flex h-full w-full items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="size-12"
                                  viewBox="0 0 303.188 303.188"
                                ><path
                                  d="M219.821 0H32.842v303.188h237.504V50.525z"
                                  fill="#e8e8e8"
                                /><path
                                  d="M230.013 149.935c-3.643-6.493-16.231-8.533-22.006-9.451-4.552-.724-9.199-.94-13.803-.936-3.615-.024-7.177.154-10.693.354l-3.861.31c-1.314-1.36-2.584-2.765-3.813-4.202-7.82-9.257-14.134-19.755-19.279-30.664 1.366-5.271 2.459-10.772 3.119-16.485 1.205-10.427 1.619-22.31-2.288-32.251-1.349-3.431-4.946-7.608-9.096-5.528-4.771 2.392-6.113 9.169-6.502 13.973-.313 3.883-.094 7.776.558 11.594.664 3.844 1.733 7.494 2.897 11.139 1.086 3.342 2.283 6.658 3.588 9.943-.828 2.586-1.707 5.127-2.63 7.603-2.152 5.643-4.479 11.004-6.717 16.161l-3.465 7.507c-3.576 7.855-7.458 15.566-11.815 23.02-10.163 3.585-19.283 7.741-26.857 12.625-4.063 2.625-7.652 5.476-10.641 8.603-2.822 2.952-5.69 6.783-5.941 11.024-.141 2.394.807 4.717 2.768 6.137 2.697 2.015 6.271 1.881 9.4 1.225 10.25-2.15 18.121-10.961 24.824-18.387 4.617-5.115 9.872-11.61 15.369-19.465l.037-.054c9.428-2.923 19.689-5.391 30.579-7.205 4.975-.825 10.082-1.5 15.291-1.974 3.663 3.431 7.621 6.555 11.939 9.164 3.363 2.069 6.94 3.816 10.684 5.119 3.786 1.237 7.595 2.247 11.528 2.886 1.986.284 4.017.413 6.092.335 4.631-.175 11.278-1.951 11.714-7.57.134-1.72-.237-3.228-.98-4.55zm-110.869 10.31c-2.169 3.36-4.261 6.382-6.232 9.041-4.827 6.568-10.34 14.369-18.322 17.286-1.516.554-3.512 1.126-5.616 1.002-1.874-.11-3.722-.937-3.637-3.065.042-1.114.587-2.535 1.423-3.931.915-1.531 2.048-2.935 3.275-4.226 2.629-2.762 5.953-5.439 9.777-7.918 5.865-3.805 12.867-7.23 20.672-10.286l-1.34 2.097zm27.222-84.26a38.17 38.17 0 0 1-.323-10.503c.184-1.713.533-3.385 1.038-4.952.428-1.33 1.352-4.576 2.826-4.993 2.43-.688 3.177 4.529 3.452 6.005 1.566 8.396.186 17.733-1.693 25.969a113.51 113.51 0 0 1-.973 3.883 121.22 121.22 0 0 1-1.648-4.821c-1.1-3.525-2.106-7.091-2.679-10.588zm16.683 66.28c-9.13 1.48-17.815 3.419-25.979 5.708.983-.275 5.475-8.788 6.477-10.555 4.721-8.315 8.583-17.042 11.358-26.197 4.9 9.691 10.847 18.962 18.153 27.214a104.71 104.71 0 0 0 2.053 2.22 235.27 235.27 0 0 0-12.062 1.61zm61.744 11.694c-.334 1.805-4.189 2.837-5.988 3.121-5.316.836-10.94.167-16.028-1.542-3.491-1.172-6.858-2.768-10.057-4.688-3.18-1.921-6.155-4.181-8.936-6.673 3.429-.206 6.9-.341 10.388-.275 3.488.035 7.003.211 10.475.664 6.511.726 13.807 2.961 18.932 7.186 1.009.833 1.331 1.569 1.214 2.207zm2.847-128.696H32.842V0h186.979z"
                                  fill="#fb3449"
                                /><path
                                  d="M126.841 241.152c0 5.361-1.58 9.501-4.742 12.421s-7.652 4.381-13.472 4.381h-3.643v15.917H92.022v-47.979h16.606c6.06 0 10.611 1.324 13.652 3.971s4.561 6.41 4.561 11.289zm-21.856 6.235h2.363c1.947 0 3.495-.546 4.644-1.641s1.723-2.604 1.723-4.529c0-3.238-1.794-4.857-5.382-4.857h-3.348v11.027zm70.23 1.477c0 8.007-2.205 14.177-6.613 18.509s-10.606 6.498-18.591 6.498h-15.523v-47.979h16.606c7.701 0 13.646 1.969 17.836 5.907s6.285 9.627 6.285 17.065zm-13.455.46c0-4.398-.87-7.657-2.609-9.78s-4.381-3.183-7.926-3.183h-3.773v26.877h2.888c3.939 0 6.826-1.143 8.664-3.43s2.756-5.78 2.756-10.484zm34.819 24.547h-12.766v-47.979h28.355v10.403h-15.589v9.156h14.374v10.403h-14.374v18.017h0z"
                                  fill="#a4a9ad"
                                /><path
                                  d="M219.821 50.525h50.525L219.821 0z"
                                  fill="#d1d3d3"
                                /></svg
                                >
                              </div>
                            {:else}
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                class="h-full w-full object-cover"
                              />
                            {/if}
                            <div
                              class="absolute bottom-0 left-0 right-0 flex h-auto items-center justify-between bg-black/60 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Button
                                variant="ghost"
                                class="flex size-6 items-center justify-center rounded-sm p-1 text-white"
                                onclick={() => {
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(file);
                                  link.download = file.name;
                                  link.click();
                                }}
                              >
                                <DownloadIcon class="size-4" />
                              </Button>
                              <div class="h-4 w-[1px] bg-white/40"></div>
                              <Button
                                variant="ghost"
                                class="flex size-6 items-center justify-center rounded-sm p-1 text-white"
                                onclick={() => {
                                  fileUpload.remove(file);
                                }}
                              >
                                <TrashIcon class="size-4" />
                              </Button>
                            </div>
                          </div>
                        {/each}
                        {#if files.length < 2}
                          <div
                            class="bg-muted/30 hover:bg-muted/50 border-muted-foreground/20 hover:border-brand/30 size-24 overflow-hidden rounded-lg border-2 border-dashed transition-all"
                          >
                            <input {...fileUpload.input} />
                            <div
                              {...fileUpload.dropzone}
                              class="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                            >
                              {#if fileUpload.isDragging}
                                <p class="text-brand text-xs font-medium">Drop here</p>
                              {:else}
                                <CloudUploadIcon class="text-muted-foreground/70 mb-1.5 size-6" />
                                <p class="text-muted-foreground/70 text-[0.7rem]">Upload File</p>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      </div>
                      <p class="text-muted-foreground text-[0.7rem]">
                        Supported formats: JPG, JPEG, PNG, PDF • Maximum size: 5MB
                      </p>
                    </div>
                  {/if}
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        {/if}
      </div>
      {#if isEditing}
        <Card.Footer class="flex items-center justify-between p-0 pt-4">
          <Alert.Description class="text-muted-foreground text-[0.7rem]">
            Changes require verification (up to 3 working days)
          </Alert.Description>
          <div class="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="font-medium"
              onclick={() => {
                isEditing = false;
                form.reset();
              }}
              disabled={$submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              class="bg-brand hover:bg-brand/80 min-w-24 font-medium text-white"
              disabled={$submitting}
            >
              {#if $submitting}
                <div
                  class="mr-2 size-3 animate-spin rounded-full border-2 border-current border-r-transparent"
                ></div>
                Saving...
              {:else}
                Save Changes
              {/if}
            </Button>
          </div>
        </Card.Footer>
      {/if}
    </div>
  </div>
</form>
