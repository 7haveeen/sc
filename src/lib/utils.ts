import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActivePath(currentPath: string, href: string, exact = false) {
  if (exact) {
    return currentPath === href;
  }

  if (href === "/") {
    return currentPath === href;
  }

  return currentPath.startsWith(href);
}

export * from "./utils/index";
