<!-- profile-image-upload.svelte -->
<script lang="ts">
  import ProfileCropperDialog from "@/components/custom/image-cropper/dialog.svelte";
  import * as Avatar from "@/components/ui/avatar";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import CameraIcon from "lucide-svelte/icons/camera";
  import { toast } from "svelte-sonner";

  const { shopName, currentImage } = $props<{
    shopName: string;
    currentImage: string | null;
  }>();

  let uploadDialogOpen = $state(false);
  let imageSrc = $state("");
  let shopImage = $state(currentImage);

  const resetFileInput = () =>
  ((document.getElementById("profile-image") as HTMLInputElement).value = "");

  const handleProfileImageUpload = (event: Event & { currentTarget: HTMLInputElement }) => {
    const file = event.currentTarget.files?.[0];
    if (
      file
      && ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
      && file.size <= 5 * 1024 * 1024
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        uploadDialogOpen = true;
        imageSrc = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    else {
      toast.error("Your photo couldn't be uploaded", {
        description: "Photos should be less than 5 MB and saved as JPG, JPEG, or PNG files.",
      });
    }
  };
</script>

<div class="group relative mx-auto aspect-square w-24 shrink-0 md:mx-0">
  <Avatar.Root
    class="ring-accent/80 h-full w-full rounded-xl ring-1 transition-all duration-200 group-hover:opacity-75"
  >
    <Avatar.Image src={shopImage} alt="Shop Logo" class="rounded-xl object-cover" />
    <Avatar.Fallback class="rounded-xl">
      {shopName
        ?.split(" ")
        .slice(0, 2)
        .map((word: string) => word[0])
        .join("")
        .toUpperCase() ?? ""}
    </Avatar.Fallback>
  </Avatar.Root>
  <Label
    for="profile-image"
    class="border-card bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 absolute -bottom-2 -right-2 flex cursor-pointer items-center justify-center rounded-full border-2 p-1 transition-all duration-200 hover:scale-110"
  >
    <CameraIcon class="size-4 text-white transition-colors" />
  </Label>
  <Input
    type="file"
    id="profile-image"
    accept=".jpg,.jpeg,.png"
    class="hidden"
    onchange={handleProfileImageUpload}
  />
</div>

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
  imageSrc={imageSrc}
/>
