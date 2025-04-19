import type { ClassType, EntityError } from "remult";
import { repo } from "remult";

export type Error<T> = {
  message: string;
  status?: number;
  original?: unknown;
  modelState?: EntityError<T>["modelState"];
};

// New type helpers for array type detection
type IsArray<T> = T extends Array<infer _> ? true : false;
type ArrayResult<T> = IsArray<T> extends true
  ? readonly [T, Error<T> | undefined]
  : readonly [T | undefined, Error<T> | undefined];
type AsyncArrayResult<T> = Promise<ArrayResult<T>>;

/**
 * Universal try function with TypeScript overloads
 * For array types, it returns an empty array instead of undefined on errors
 *
 * @example
 * // Fetch API:
 * const [user, error] = await try_<User>('/api/users/1');
 *
 * // Array handling (returns [] instead of undefined on error):
 * const [tasks, error] = await try_<Task[]>('/api/tasks');
 *
 * // Async function:
 * const [data, error] = await try_(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 *
 * // Sync function:
 * const [json, error] = try_(() => JSON.parse(jsonString));
 */

// Overloads
export function try_<T>(url: string, init?: RequestInit): AsyncArrayResult<T>;
export function try_<T>(
  fn: Promise<T> | (() => Promise<T>)
): AsyncArrayResult<T>;
export function try_<T>(fn: () => T): ArrayResult<T>;

// Implementation
export function try_<T>(
  input: string | Promise<T> | (() => Promise<T>) | (() => T),
  init?: RequestInit,
): ArrayResult<T> | AsyncArrayResult<T> {
  const handleError = (error: unknown): Error<T> => {
    if ((error as EntityError<T>)?.modelState) {
      const entityError = error as EntityError<T>;
      return {
        message: entityError.message || String(error),
        modelState: entityError.modelState,
        original: entityError,
      };
    }
    if (error instanceof Response) {
      return {
        message: "HTTP error " + error.status + ": " + error.statusText,
        status: error.status,
        original: error,
      };
    }
    if (error instanceof Error) {
      return {
        message: error.message,
        original: error,
      };
    }
    return {
      message:
        typeof error === "object" && error && "message" in error
          ? String(error.message)
          : String(error),
      original: error,
    };
  };

  // Helper to create the appropriate result tuple based on type T
  const errorResult = (error: Error<T>): ArrayResult<T> => {
    const emptyValue = Array.isArray({} as T)
      ? ([] as unknown as T)
      : undefined;
    return [emptyValue, error] as ArrayResult<T>;
  };

  // Helper to create success result tuple
  const successResult = (data: T): ArrayResult<T> => {
    return [data, undefined] as ArrayResult<T>;
  };

  // Handle fetch URL
  if (typeof input === "string") {
    return (async () => {
      try {
        const response = await fetch(input, init);
        if (!response.ok) {
          return errorResult({
            message:
              "HTTP error " + response.status + ": " + response.statusText,
            status: response.status,
            original: response,
          });
        }
        return successResult((await response.json()) as T);
      }
      catch (error) {
        return errorResult(handleError(error));
      }
    })();
  }

  // Handle Promise
  if (input instanceof Promise) {
    return input
      .then(data => successResult(data))
      .catch(error => errorResult(handleError(error)));
  }

  // Handle function (sync or async)
  try {
    const result = input();
    if (result instanceof Promise) {
      return result
        .then(data => successResult(data))
        .catch(error => errorResult(handleError(error)));
    }
    return successResult(result as T);
  }
  catch (error) {
    return errorResult(handleError(error));
  }
}

/**
 * Helper function to convert repository query results to JSON with proper typing
 *
 * @example
 * // Instead of: repo(Task).toJson(repo(Task).find())
 * // You can use: _toJson(Task, repo(Task).find())
 */
export function _toJson<T>(
  entity: ClassType<T>,
  queryPromise: Promise<T[]>,
): Promise<T[]> {
  return repo(entity).toJson(queryPromise) as Promise<T[]>;
}
