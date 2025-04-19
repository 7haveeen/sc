import Root, { createCountdown, resendCode } from "./countdown.svelte";

// Main component export
export { Root as Countdown };

// Re-export utility functions
export { createCountdown, resendCode };

// Re-export types with proper syntax
export type { ButtonProps, CountdownConfig } from "./countdown.svelte";

// Following the "one export per file" principle
export default Root;
