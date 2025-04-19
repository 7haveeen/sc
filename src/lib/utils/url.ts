import { pushState } from "$app/navigation";

/**
 * Update a query parameter in the URL without causing a page reload
 */
export function setQueryParam(key: string, value: string): void {
  const url = new URL(window.location.href);

  if (value) {
    url.searchParams.set(key, value);
  }
  else {
    url.searchParams.delete(key);
  }

  pushState(url.toString(), {});
}

/**
 * Get a query parameter from the URL
 */
export function getQueryParam(key: string): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}
