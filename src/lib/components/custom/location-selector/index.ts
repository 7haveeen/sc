export { default as LocationSelector } from "./location-selector.svelte";

export type LocationSelectorProps = {
  onLocationSelect?: (location: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  }) => void;
  disabled?: boolean;
};
