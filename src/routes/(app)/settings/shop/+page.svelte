<script lang="ts">
  import ProfileCropperDialog from "@/components/custom/image-cropper/dialog.svelte";
  import PhoneInput from "@/components/custom/input-phone/phone-input.svelte";
  import { Textarea } from "@/components/custom/textarea";
  import * as Alert from "@/components/ui/alert";
  import * as Avatar from "@/components/ui/avatar";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import * as Card from "@/components/ui/card";
  import * as Form from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import * as Tabs from "@/components/ui/tabs";
  import { goto, invalidateAll } from "$app/navigation";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { RadioGroup } from "bits-ui";
  import BadgeCheck from "lucide-svelte/icons/badge-check";
  import Briefcase from "lucide-svelte/icons/briefcase";
  import CameraIcon from "lucide-svelte/icons/camera";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import UploadIcon from "lucide-svelte/icons/cloud-upload";
  import CreditCard from "lucide-svelte/icons/credit-card";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import LayoutDashboard from "lucide-svelte/icons/layout-dashboard";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Lock from "lucide-svelte/icons/lock";
  import Settings from "lucide-svelte/icons/settings";
  import Star from "lucide-svelte/icons/star";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import Users from "lucide-svelte/icons/users";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  import BusinessRegInfo from "./components/business-reg-info.svelte";
  import { shopProfileSchema } from "./dto/schema";
  import { hasBusinessPerm } from "$modules/org";
  import { slugify } from "@/utils";

  const { data } = $props();

  let uploadDialogOpen = $state(false);
  let imageSrc = $state("");
  let popoverOpen = $state(false);

  const EditSection = {
    NONE: "none",
    PROFILE_BASIC: "profile_basic",
    SETTINGS_GENERAL: "settings_general",
    SETTINGS_PREFERENCES: "settings_preferences",
    BUSINESS_REGISTRATION: "business_registration",
    BUSINESS_TAX: "business_tax",
  } as const;

  type EditSectionType = (typeof EditSection)[keyof typeof EditSection];
  let activeEditSections = $state<Set<EditSectionType>>(new Set());

  type VerificationStatus = "not-verified" | "submitted" | "verified" | "rejected";
  const verificationStatus = $state<VerificationStatus>("not-verified");

  function isEditing(section: EditSectionType) {
    return activeEditSections.has(section);
  }

  let activeTab = $state(data.currentTab ?? "overview");
  let currency = $state("USD");
  let timezone = $state("UTC");
  const followers = $state(3.2);
  const rating = $state(4.5);

  let vatStatus = $state("non-vat");
  let vatNumber = $state("");
  // let taxDocuments = $state<File[]>([]);
  let shopImage = $state<string | null>(null);
  const isVerificationInProgress = $state(false);
  const verificationStartedAt = $state<Date | undefined>(undefined);

  const shopProfileForm = superForm(data.shopProfileForm, {
    validators: zodClient(shopProfileSchema),
    onUpdate: async ({ result, cancel }) => {
      if (result.type === "failure") {
        toast.error(result.data?.message);
        cancel();
      }
    },
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success("Shop profile updated successfully");
        toggleEdit(EditSection.PROFILE_BASIC);
        invalidateAll();
      }
    },
    onError: () => {
      toast.error("Failed to update shop profile", {
        description: "Please try again later...",
      });
    },
  });

  const {
    form: shopProfileFormData,
    enhance: shopProfileFormEnhance,
    submitting: shopProfileFormSubmitting,
  } = shopProfileForm;

  let formBackup = $state<typeof $shopProfileFormData | null>(null);

  function resetFileInput() {
    const input = document.getElementById("profile-image") as HTMLInputElement;
    if (input)
      input.value = "";
  }

  function toggleEdit(section: EditSectionType) {
    const newSections = new Set(activeEditSections);
    if (newSections.has(section)) {
      if (section === EditSection.PROFILE_BASIC && formBackup) {
        $shopProfileFormData = { ...formBackup };
        formBackup = null;
      }
      newSections.delete(section);
    }
    else {
      if (section === EditSection.PROFILE_BASIC) {
        formBackup = { ...$shopProfileFormData };
      }
      newSections.add(section);
    }
    activeEditSections = newSections;
  }

  type VerificationStep = {
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    date?: Date;
  };

  const verificationSteps = $derived<VerificationStep[]>([
    {
      title: "Verification Initiated",
      description: "Your business verification request has been received",
      status: "completed",
      date: verificationStartedAt,
    },
    {
      title: "Document Review",
      description: "Our team is reviewing your submitted documents",
      status: "completed",
      date: verificationStartedAt,
    },
    {
      title: "Background Check",
      description: "Verifying business information and compliance",
      status: "in-progress",
      date: verificationStartedAt,
    },
    {
      title: "Final Approval",
      description: "Final review and approval of your business verification",
      status: "pending",
    },
  ]);

  /* async function handleSaveChanges() {
    isVerificationInProgress = true;
    verificationStartedAt = new Date();
    verificationStatus = "verified";
  } */

  function handleFileUpload(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const input = event.currentTarget;
    if (input.files?.length) {
    // taxDocuments = Array.from(input.files);
    }
  }

  function handleProfileImageUpload(
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    const input = event.currentTarget;
    const imageFile = input.files?.[0];
    popoverOpen = false;
    if (imageFile) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(imageFile.type)) {
        toast.error("Your photo couldn't be uploaded", {
          description: "Photos should be less than 5 MB and saved as JPG, JPEG, or PNG files.",
        });
        return;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        toast.error("Your photo couldn't be uploaded", {
          description: "Photos should be less than 5 MB and saved as JPG, JPEG, or PNG files.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result as string;
        uploadDialogOpen = true;
        imageSrc = imageDataUrl;
      };
      reader.readAsDataURL(imageFile);
    }
  }

  function previewShop() {
    window.open(`/shop/${$shopProfileFormData.slug}`, "_blank");
  }

  function setTab(tab: string) {
    activeTab = tab;
    goto(`?tab=${tab}`, { replaceState: true });
  }

  const verificationStatusConfig = {
    "not-verified": {
      label: "Not Verified",
      class: "bg-muted-foreground/10 text-muted-foreground",
    },
    "submitted": {
      label: "Verification Pending",
      class: "bg-amber-500/10 text-amber-500",
    },
    "verified": {
      label: "Verified",
      class: "bg-emerald-500/10 text-emerald-500",
    },
    "rejected": {
      label: "Verification Rejected",
      class: "bg-destructive/10 text-destructive",
    },
  } as const;

  const shopDetails = $derived(data.shop);
</script>

<div class="container mx-auto space-y-6 px-4 py-4">
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
      <p class="text-muted-foreground mt-1 text-sm">Manage your shop settings and preferences</p>
    </div>
  </div>

  <!-- <pre>{JSON.stringify(data.shop, null, 2)}</pre> -->

  <div class="grid gap-6">
    <ProfileCropperDialog
      open={uploadDialogOpen}
      onOpenChange={(open) => {
        uploadDialogOpen = open;
        if (!open) {
          imageSrc = "";
          resetFileInput();
        }
      }}
      onSave={async (imageString) => {
        const response = await fetch(imageString);
        const imageBlob = await response.blob();
        shopImage = URL.createObjectURL(imageBlob);
      }}
      {imageSrc}
    />

    <Tabs.Root value={activeTab} onValueChange={setTab} class="w-full">
      <Card.Root class="border-none shadow-sm">
        <Card.Content class="space-y-6 p-4 pb-0 md:p-6 md:pb-0">
          <div class="flex flex-col gap-6 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
            <div class="group relative mx-auto aspect-square w-24 shrink-0 md:mx-0">
              <Avatar.Root
                class="ring-accent/80 h-full w-full rounded-xl ring-1 transition-all duration-200 group-hover:opacity-75"
              >
                <Avatar.Image
                  src={shopImage ?? shopDetails?.logo}
                  alt="Shop Logo"
                  class="rounded-xl object-cover"
                />
                <Avatar.Fallback class="rounded-xl">
                  {shopDetails?.name
                    .split(" ")
                    .slice(0, 2)
                    .map(word => word[0])
                    .join("")
                    .toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <Popover.Root bind:open={popoverOpen}>
                <Popover.Trigger
                  class="border-card bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 absolute -bottom-2 -right-2 flex cursor-pointer items-center justify-center rounded-full border-2 p-1 transition-all duration-200 hover:scale-105 data-[state=open]:scale-105"
                >
                  <CameraIcon class="size-4 text-white transition-colors" />
                </Popover.Trigger>
                <Popover.Content class="w-auto p-1" sideOffset={3}>
                  <div class="flex flex-col">
                    <Label
                      for="profile-image"
                      class="hover:bg-accent flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-xs"
                    >
                      <UploadIcon class="size-4" />
                      Upload from computer
                    </Label>
                    <Button
                      class="text-destructive flex w-full items-center gap-2 px-3 py-2 text-xs"
                      variant="ghost"
                      onclick={() => {
                        shopImage = null;
                        resetFileInput();
                        popoverOpen = false;
                      }}
                    >
                      <TrashIcon class="size-4" />
                      Remove profile picture
                    </Button>
                  </div>
                </Popover.Content>
              </Popover.Root>
              <Input
                type="file"
                id="profile-image"
                accept=".jpg,.jpeg,.png"
                class="hidden"
                onchange={handleProfileImageUpload}
              />
            </div>
            <div class="space-y-4 text-center md:text-left">
              <div class="space-y-2">
                <div class="flex flex-col items-center gap-2 md:flex-row md:gap-4">
                  <h2 class="max-w-[200px] truncate text-xl font-semibold tracking-tight">
                    <span class="flex items-center gap-1.5">
                      {data.shop?.name}
                      {#if verificationStatus === "verified"}
                        <BadgeCheck class="text-brand size-4 shrink-0" />
                      {/if}
                    </span>
                  </h2>
                  <div class="flex items-center gap-2">
                    {#if verificationStatus === "verified"}
                      <Badge
                        class="bg-brand/10 text-brand pointer-events-none cursor-default gap-1 rounded-full px-2 text-[0.7rem] font-semibold shadow-none"
                      >
                        Upgrade Subscription
                      </Badge>
                    {:else}
                      <Badge
                        class="pointer-events-none cursor-default gap-1 rounded-full px-2 text-[0.7rem] font-semibold shadow-none {verificationStatusConfig[
                          verificationStatus
                        ].class}"
                      >
                        {verificationStatusConfig[verificationStatus].label}
                      </Badge>
                    {/if}
                  </div>
                </div>
                <div
                  class="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs md:justify-start"
                >
                  <span class="max-w-52 truncate">{shopDetails?.email ?? "No Email"}</span>
                  {#if shopDetails?.email && shopDetails?.address}
                    <span class="bg-muted-foreground h-1 w-1 rounded-full opacity-50"></span>
                  {/if}
                  <span class="max-w-52 truncate">{shopDetails?.address ?? "No Address"}</span>
                </div>
                <div
                  class="flex flex-wrap items-center justify-center gap-4 md:justify-start md:gap-6"
                >
                  <div class="flex items-center gap-1.5">
                    <Users class="text-muted-foreground size-4" />
                    <span class="text-muted-foreground text-sm"
                    >{followers.toLocaleString()}k Followers</span
                    >
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Star class="text-muted-foreground size-4" />
                    <span class="text-muted-foreground text-sm">{rating} Rating</span>
                  </div>
                  <Button
                    variant="link"
                    onclick={previewShop}
                    class="text-muted-foreground hover:text-primary h-[20px] gap-2 p-0 font-normal hover:no-underline"
                  >
                    <ExternalLink class="size-3.5" />
                    Preview Shop
                  </Button>
                </div>
              </div>
            </div>
            <div class="flex justify-center md:justify-end">
              <div class="w-48 space-y-3">
                <p class="text-center text-sm font-medium md:text-left">Profile Completion</p>
                <div class="bg-secondary h-1 overflow-hidden rounded-full">
                  <div class="bg-primary h-full w-[50%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex">
            <Tabs.List
              class="inline-flex w-auto justify-start gap-2 overflow-y-hidden bg-transparent"
            >
              <Tabs.Trigger
                value="overview"
                class="data-[state=active]:border-primary data-[state=active]:text-primary gap-2 whitespace-nowrap rounded-none border-b-[1px] border-transparent px-3 py-2 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <LayoutDashboard class="size-4 focus:outline-none" />
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger
                value="settings"
                class="data-[state=active]:border-primary data-[state=active]:text-primary gap-2 whitespace-nowrap rounded-none border-b-[1px] border-transparent px-3 py-2 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Settings class="size-4 focus:outline-none" />
                Settings
              </Tabs.Trigger>
              <Tabs.Trigger
                value="billing"
                class="data-[state=active]:border-primary data-[state=active]:text-primary gap-2 whitespace-nowrap rounded-none border-b-[1px] border-transparent px-3 py-2 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <CreditCard class="size-4 focus:outline-none" />
                Billing
              </Tabs.Trigger>
              <Tabs.Trigger
                value="security"
                class="data-[state=active]:border-primary data-[state=active]:text-primary gap-2 whitespace-nowrap rounded-none border-b-[1px] border-transparent px-3 py-2 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Lock class="size-4 focus:outline-none" />
                Security
              </Tabs.Trigger>
              {#if hasBusinessPerm.read()}
                <Tabs.Trigger
                  value="business"
                  class="data-[state=active]:border-primary data-[state=active]:text-primary gap-2 whitespace-nowrap rounded-none border-b-[1px] border-transparent px-3 py-2 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Briefcase class="size-4 focus:outline-none" />
                  Business
                </Tabs.Trigger>
              {/if}
            </Tabs.List>
          </div>
        </Card.Content>
      </Card.Root>
      <Tabs.Content value="overview" class="py-6">
        <form method="POST" use:shopProfileFormEnhance>
          <div class="flex flex-col space-y-6">
            <Card.Root class="border-none shadow-sm">
              <Card.Content class="p-6 md:p-10">
                <div class="grid gap-8 md:grid-cols-3 md:gap-24">
                  <div class="space-y-2">
                    <h2 class="text-lg font-semibold">Shop Profile Management</h2>
                    <p class="text-muted-foreground text-xs">
                      Manage your shop's public profile information. This information will be
                      visible to all customers visiting your shop.
                    </p>
                  </div>

                  <div class="space-y-6 md:col-span-2">
                    <div class="space-y-6">
                      <div class="grid gap-6">
                        <div class="grid gap-4 md:grid-cols-2">
                          <Form.Field form={shopProfileForm} name="name">
                            <Form.Control>
                              {#snippet children({ props })}
                                <Form.Label class="data-[fs-error]:text-foreground">
                                  Shop name
                                </Form.Label>
                                <div class="relative">
                                  <Input
                                    {...props}
                                    disabled={!isEditing(EditSection.PROFILE_BASIC)}
                                    bind:value={$shopProfileFormData.name}
                                    placeholder="Enter your shop name"
                                    maxlength={30}
                                    autocomplete="off"
                                    class="disabled:cursor-default disabled:border-none disabled:p-0 {isEditing(
                                      EditSection.PROFILE_BASIC,
                                    )
                                      ? "pr-12"
                                      : ""}"
                                  />
                                  {#if isEditing(EditSection.PROFILE_BASIC)}
                                    <span
                                      class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem]"
                                    >
                                      {$shopProfileFormData?.name?.length ?? 0}/30
                                    </span>
                                  {/if}
                                </div>
                              {/snippet}
                            </Form.Control>
                            <Form.FieldErrors class="text-[0.7rem]" />
                          </Form.Field>

                          <Form.Field form={shopProfileForm} name="slug">
                            <Form.Control>
                              {#snippet children({ props })}
                                <Form.Label class="data-[fs-error]:text-foreground">
                                  Shop URL
                                </Form.Label>
                                <Input
                                  {...props}
                                  disabled
                                  value={slugify($shopProfileFormData.name)}
                                  class="disabled:cursor-default disabled:border-none disabled:p-0"
                                />
                              {/snippet}
                            </Form.Control>
                            <Form.FieldErrors class="text-[0.7rem]" />
                          </Form.Field>
                        </div>

                        <div class="grid gap-4 md:grid-cols-2">
                          <Form.Field form={shopProfileForm} name="email">
                            <Form.Control>
                              {#snippet children({ props })}
                                <Form.Label class="data-[fs-error]:text-foreground">
                                  Shop email
                                </Form.Label>
                                <Input
                                  {...props}
                                  type="email"
                                  disabled={!isEditing(EditSection.PROFILE_BASIC)}
                                  bind:value={$shopProfileFormData.email}
                                  placeholder="shop@example.com"
                                  autocomplete="off"
                                  class="disabled:cursor-default disabled:border-none disabled:p-0"
                                />
                              {/snippet}
                            </Form.Control>
                            <Form.FieldErrors class="text-[0.7rem]" />
                          </Form.Field>

                          <Form.Field form={shopProfileForm} name="phone">
                            <Form.Control>
                              {#snippet children({ props })}
                                <Form.Label class="data-[fs-error]:text-foreground">
                                  Shop phone
                                </Form.Label>
                                <PhoneInput
                                  {...props}
                                  type="tel"
                                  disabled={!isEditing(EditSection.PROFILE_BASIC)}
                                  bind:value={$shopProfileFormData.phone}
                                  placeholder="+263 7XX XXX XXX"
                                  autocomplete="off"
                                  class="disabled:cursor-default disabled:border-none disabled:p-0"
                                />
                              {/snippet}
                            </Form.Control>
                            <Form.FieldErrors class="text-[0.7rem]" />
                          </Form.Field>
                        </div>

                        <Form.Field form={shopProfileForm} name="address">
                          <Form.Control>
                            {#snippet children({ props })}
                              <Form.Label class="data-[fs-error]:text-foreground">
                                Shop address
                              </Form.Label>
                              <Input
                                {...props}
                                disabled={!isEditing(EditSection.PROFILE_BASIC)}
                                bind:value={$shopProfileFormData.address}
                                placeholder="Enter your shop's physical address"
                                autocomplete="off"
                                class="disabled:cursor-default disabled:border-none disabled:p-0"
                              />
                            {/snippet}
                          </Form.Control>
                          <Form.FieldErrors class="text-[0.7rem]" />
                        </Form.Field>

                        <Form.Field form={shopProfileForm} name="description">
                          <Form.Control>
                            {#snippet children({ props })}
                              <Form.Label class="data-[fs-error]:text-foreground">
                                Description
                              </Form.Label>
                              <Textarea
                                {...props}
                                maxHeight={96}
                                disabled={!isEditing(EditSection.PROFILE_BASIC)}
                                bind:value={$shopProfileFormData.description}
                                placeholder="Describe what your shop is about, what you sell, and your unique value proposition"
                                autocomplete="off"
                                class="resize-none disabled:cursor-default disabled:border-none disabled:p-0"
                              />
                            {/snippet}
                          </Form.Control>
                          <div class="flex items-center justify-between">
                            <Form.FieldErrors class="text-[0.7rem]" />
                            {#if isEditing(EditSection.PROFILE_BASIC)}
                              <span class="text-muted-foreground text-[0.7rem]">
                                {$shopProfileFormData?.description?.length ?? 0}/300
                              </span>
                            {/if}
                          </div>
                        </Form.Field>
                      </div>
                    </div>
                    {#if isEditing(EditSection.PROFILE_BASIC)}
                      <Alert.Root
                        class="rounded-sm border border-dashed border-amber-500 bg-amber-50 p-2 dark:border-amber-900/50 dark:bg-amber-900/30"
                      >
                        <Alert.Description
                          class="flex items-center gap-4 text-pretty text-[0.7rem] text-amber-700 dark:text-amber-400"
                        >
                          Shop name changes must follow our naming guidelines and modifications are
                          allowed every six months.
                        </Alert.Description>
                      </Alert.Root>
                    {/if}
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            <div class="flex justify-end gap-2">
              <Button variant="outline" onclick={() => toggleEdit(EditSection.PROFILE_BASIC)}>
                {#if isEditing(EditSection.PROFILE_BASIC)}Cancel{:else}Edit{/if}
              </Button>
              {#if isEditing(EditSection.PROFILE_BASIC)}
                <Form.Button disabled={$shopProfileFormSubmitting}>
                  {#if $shopProfileFormSubmitting}
                    <LoaderCircle class="animate-spin" />
                  {:else}
                    Save changes
                  {/if}
                </Form.Button>
              {/if}
            </div>
          </div>
        </form>
      </Tabs.Content>

      <Tabs.Content value="settings" class="py-6">
        <div class="flex flex-col gap-6">
          <Card.Root class="border-none shadow-sm">
            <Card.Content class="p-6 md:p-10">
              <div class="grid gap-8 md:grid-cols-3 md:gap-24">
                <div class="space-y-2">
                  <h2 class="text-lg font-semibold">Shop Settings</h2>
                  <p class="text-muted-foreground text-xs">
                    Manage your shop's settings and preferences. These settings control how your
                    shop operates.
                  </p>
                </div>

                <div class="space-y-6 md:col-span-2">
                  <div class="space-y-6">
                    <div class="grid gap-6">
                      <div class="space-y-2">
                        <Label for="currency">Currency</Label>
                        <Input
                          disabled={!isEditing(EditSection.SETTINGS_GENERAL)}
                          type="text"
                          id="currency"
                          bind:value={currency}
                          class="disabled:cursor-default disabled:border-none disabled:p-0"
                        />
                      </div>

                      <div class="space-y-2">
                        <Label for="timezone">Timezone</Label>
                        <Input
                          disabled={!isEditing(EditSection.SETTINGS_GENERAL)}
                          type="text"
                          id="timezone"
                          bind:value={timezone}
                          class="disabled:cursor-default disabled:border-none disabled:p-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          <div class="flex justify-end gap-2">
            <Button variant="outline" onclick={() => toggleEdit(EditSection.SETTINGS_GENERAL)}>
              {#if isEditing(EditSection.SETTINGS_GENERAL)}Cancel{:else}Edit{/if}
            </Button>
            {#if isEditing(EditSection.SETTINGS_GENERAL)}
              <Button>Save changes</Button>
            {/if}
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content value="billing" class="py-6">
        <Card.Root class="border-none shadow-sm">
          <Card.Header class="p-6 md:p-10">
            <Card.Title>Billing</Card.Title>
            <Card.Description>Manage your billing information and subscriptions.</Card.Description>
          </Card.Header>
          <Card.Content class="p-6 md:p-10">
            <!-- Billing content -->
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <Tabs.Content value="security" class="py-6">
        <Card.Root class="border-none shadow-sm">
          <Card.Header class="p-6 md:p-10">
            <Card.Title>Security</Card.Title>
            <Card.Description>Manage your security settings and preferences.</Card.Description>
          </Card.Header>
          <Card.Content class="p-6 md:p-10">
            <!-- Security content -->
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      {#if hasBusinessPerm.read()}
        <Tabs.Content value="business" class="space-y-6 py-6">
          <div class="flex flex-col space-y-6">
            <Card.Root class="border-none shadow-sm">
              <Card.Content class="p-6 md:p-10">
                <div class="grid gap-8 md:grid-cols-3 md:gap-24">
                  <div class="space-y-2">
                    <h2 class="text-lg font-semibold">Business Information</h2>
                    <p class="text-muted-foreground text-xs">
                      Provide your business registration details. This information will be used for
                      official documentation.
                    </p>
                  </div>

                  <div class="space-y-6 md:col-span-2">
                    {#if isVerificationInProgress}
                      <div class="relative">
                        {#each verificationSteps as step, i}
                          <div class="flex gap-4 pb-8 last:pb-0">
                            <div class="relative flex flex-col items-center">
                              <div
                                class="size-3 rounded-full ring-[3px] {step.status === "completed"
                                  ? "bg-brand ring-brand/20"
                                  : step.status === "in-progress"
                                  ? "bg-amber-500 ring-amber-500/20"
                                  : "bg-muted-foreground/30 ring-muted-foreground/10"}"
                              ></div>
                              {#if i !== verificationSteps.length - 1}
                                <div
                                  class="absolute top-3 h-full w-[2px] {step.status === "completed"
                                    ? "bg-brand/30"
                                    : "bg-border/40"}"
                                ></div>
                              {/if}
                            </div>
                            <div class="flex-1 pb-8 last:pb-0">
                              <div class="flex flex-col gap-0.5">
                                <h3 class="text-sm font-medium">{step.title}</h3>
                                <p class="text-muted-foreground text-xs">
                                  {step.description}
                                </p>
                                {#if step.date}
                                  <p class="text-muted-foreground/70 mt-1 text-[0.7rem]">
                                    {step.date.toLocaleString()}
                                  </p>
                                {/if}
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <BusinessRegInfo {data} />
                    {/if}
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>

          <div class="flex flex-col space-y-6">
            <Card.Root class="border-none shadow-sm">
              <Card.Content class="p-6 md:p-10">
                <div class="grid gap-8 md:grid-cols-3 md:gap-24">
                  <div class="space-y-2">
                    <h2 class="text-lg font-semibold">Tax Information</h2>
                    <p class="text-muted-foreground text-xs">
                      Manage your tax registration status and related documentation. This
                      information is required for tax compliance.
                    </p>
                  </div>

                  <div class="space-y-6 md:col-span-2">
                    <div class="space-y-6">
                      <div class="grid gap-6">
                        <div class="space-y-6">
                          <Label>Registration Status</Label>
                          <RadioGroup.Root
                            value={vatStatus}
                            onValueChange={value => (vatStatus = value)}
                            class="flex flex-col gap-4 md:flex-row md:gap-8"
                          >
                            <div class="flex items-center space-x-2">
                              <RadioGroup.Item
                                value="non-vat"
                                id="non-vat"
                                disabled={!isEditing(EditSection.BUSINESS_TAX)}
                              >
                                {#snippet children({ checked })}
                                  {#if checked}
                                    <CircleCheck class="text-brand size-4" />
                                  {/if}
                                {/snippet}
                              </RadioGroup.Item>
                              <Label for="non-vat" class="font-normal">Non-VAT Registered</Label>
                            </div>
                            <div class="flex items-center space-x-2">
                              <RadioGroup.Item
                                value="vat"
                                id="vat"
                                disabled={!isEditing(EditSection.BUSINESS_TAX)}
                              >
                                {#snippet children({ checked })}
                                  {#if checked}
                                    <CircleCheck class="text-brand size-4" />
                                  {/if}
                                {/snippet}
                              </RadioGroup.Item>
                              <Label for="vat" class="font-normal">VAT Registered</Label>
                            </div>
                          </RadioGroup.Root>
                        </div>
                        {#if vatStatus === "vat"}
                          <div class="grid gap-4 md:grid-cols-2">
                            <div class="space-y-2">
                              <Label for="vat-number">VAT Number</Label>
                              <Input
                                disabled={!isEditing(EditSection.BUSINESS_TAX)}
                                type="text"
                                id="vat-number"
                                bind:value={vatNumber}
                                placeholder="Enter VAT number"
                                class="disabled:cursor-default disabled:border-none disabled:p-0"
                              />
                            </div>
                          </div>

                          <div class="grid gap-4 md:grid-cols-2">
                            <div class="space-y-2">
                              <Label>VAT Certificate</Label>
                              <div class="flex flex-col gap-2">
                                <Input
                                  disabled={!isEditing(EditSection.BUSINESS_TAX)}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onchange={handleFileUpload}
                                  class="disabled:cursor-not-allowed"
                                />
                                <p class="text-muted-foreground text-xs">
                                  Upload VAT Certificate (PDF, JPG, PNG only)
                                </p>
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            <div class="flex justify-end gap-2">
              <Button variant="outline" onclick={() => toggleEdit(EditSection.BUSINESS_TAX)}>
                {#if isEditing(EditSection.BUSINESS_TAX)}Cancel{:else}Edit{/if}
              </Button>
              {#if isEditing(EditSection.BUSINESS_TAX)}
                <Button>Save changes</Button>
              {/if}
            </div>
          </div>
        </Tabs.Content>
      {/if}
    </Tabs.Root>
  </div>
</div>
