<script lang="ts">
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Slider } from "@/components/ui/slider";
  import Cropper from "svelte-easy-crop";

  import type { CropArea, ImageSrc } from "./index";

  import getCroppedImg from "./index";

  const { open, onOpenChange, onSave, imageSrc } = $props<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (croppedImage: string) => void;
    imageSrc: ImageSrc;
  }>();

  let crop = $state({ x: 0, y: 0 });
  let zoom = $state(1);
  let error = $state<string | null>(null);
  let croppedArea = $state<CropArea | null>(null);

  const handleSave = async () => {
    try {
      if (!croppedArea)
        throw new Error("No crop area");
      const croppedImage = await getCroppedImg(imageSrc, croppedArea);
      onSave(croppedImage);
      resetImage();
    }
    catch (e) {
      error = "Failed to crop image";
      console.error(e);
    }
  };

  function resetImage() {
    zoom = 1;
    crop = { x: 0, y: 0 };
    error = null;
    croppedArea = null;
    onOpenChange(false);
  }
</script>

<Dialog {open} {onOpenChange}>
  <DialogContent class="sm:max-w-96">
    <DialogHeader>
      <DialogTitle>Crop Image and Upload</DialogTitle>
      <DialogDescription class="text-xs">Crop and adjust your profile picture.</DialogDescription>
    </DialogHeader>
    <div class="grid gap-4">
      {#if error}
        <div class="bg-destructive/15 text-destructive rounded-md px-4 py-2 text-sm">
          {error}
        </div>
      {/if}
      {#if imageSrc}
        <div class="space-y-4">
          <div class="relative aspect-square overflow-clip rounded-lg">
            <Cropper
              image={imageSrc}
              bind:crop
              bind:zoom
              cropShape="round"
              showGrid={false}
              aspect={1}
              oncropcomplete={e => (croppedArea = e.pixels)}
            />
          </div>
          <Slider bind:value={zoom} min={1} max={3} step={0.1} type="single" />
          <div class="flex gap-2">
            <Button variant="ghost" onclick={resetImage} class="flex-1">Cancel</Button>
            <Button onclick={handleSave} class="flex-1">Save</Button>
          </div>
        </div>
      {/if}
    </div>
  </DialogContent>
</Dialog>
