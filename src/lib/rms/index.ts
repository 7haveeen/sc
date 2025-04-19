import type { RequestEvent } from "@sveltejs/kit";
import type { ClassType, Remult } from "remult";
import type { InitRequestOptions, RemultServerOptions } from "remult/server";

import { remultSveltekit } from "remult/remult-sveltekit";
import { Log } from "@kitql/helpers";
import { building } from "$app/environment";

/** Module configuration options */
type ModuleInput = {
  name: string;
  priority?: number;
  entities?: ClassType<unknown>[];
  controllers?: ClassType<unknown>[];
  initApi?: RemultServerOptions<RequestEvent>["initApi"];
  initRequest?: RemultServerOptions<RequestEvent>["initRequest"];
  modules?: Module[];
};

/**
 * Module component representing a unit of functionality
 * @class
 */
export class Module {
  name: string;
  priority?: number;
  entities?: ClassType<unknown>[];
  controllers?: ClassType<unknown>[];
  initApi?: RemultServerOptions<RequestEvent>["initApi"];
  initRequest?: RemultServerOptions<RequestEvent>["initRequest"];
  modules?: Module[];
  log: Log;

  constructor(input: ModuleInput) {
    this.name = input.name;
    this.priority = input.priority;
    this.entities = input.entities;
    this.controllers = input.controllers;
    this.initApi = input.initApi;
    this.initRequest = input.initRequest;
    this.modules = input.modules;
    this.log = new Log(`rms | ${this.name}`);
  }
}

/** Remult Module System configuration options */
type Options = RemultServerOptions<
  RequestEvent<Partial<Record<string, string>>, string | null>
> & {
  modules?: Module[];
};

/** Error type for handling Remult-specific errors */
type RemultError = {
  httpStatusCode: number;
  responseBody: unknown;
  sendError: (statusCode: number, body: unknown) => void;
};

/**
 * Creates a flattened and priority-ordered list of modules
 * @param {Module[]} modules - Array of modules to flatten and order
 * @returns {Module[]} Flattened and priority-ordered module array
 */
export function modulesFlatAndOrdered(modules: Module[]): Module[] {
  const flattenModules = (moduleList: Module[], parentName = ""): Module[] => {
    return moduleList.reduce<Module[]>((accumulated, module) => {
      const fullName = parentName
        ? `${parentName}-${module.name}`
        : module.name;

      const { modules: nestedModules, ...flatModuleProps } = module;
      const flatModule = { ...flatModuleProps, name: fullName } as Module;
      const subModules = nestedModules
        ? flattenModules(nestedModules, fullName)
        : [];

      return [...accumulated, flatModule, ...subModules];
    }, []);
  };

  const flatModules = flattenModules(modules);
  return [...flatModules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

/**
 * Initializes the Remult Module System
 * @param {Options} options - Configuration options for Remult
 * @returns {import('@sveltejs/kit').Handle} SvelteKit handle function for server hooks
 * @example
 * export const handle = rms({
 *   modules: [authModule(), todoModule()],
 *   getUser: async event => event.locals.user
 * });
 */
export function rms(options: Options) {
  const defaultModule = new Module({
    name: "default",
    entities: options.entities ?? [],
    controllers: options.controllers ?? [],
    initRequest: options.initRequest,
    initApi: options.initApi,
  });

  const modulesSorted = modulesFlatAndOrdered([
    ...(options.modules ?? []),
    defaultModule,
  ]);

  // Maps for deduplication
  const entitiesMap = new Map<string, ClassType<unknown>>();
  const controllersMap = new Map<string, ClassType<unknown>>();

  // Pre-allocate the approximate map size for better performance
  modulesSorted.forEach((module) => {
    if (module.entities?.length) {
      module.entities.forEach(entity => entitiesMap.set(entity.name, entity));
    }
    if (module.controllers?.length) {
      module.controllers.forEach(controller =>
        controllersMap.set(controller.name, controller),
      );
    }
  });

  // Create handlers once to avoid recreating them in each request
  const handleRequest = async (
    kitEvent: RequestEvent,
    op: InitRequestOptions,
  ) => {
    for (const module of modulesSorted) {
      const initRequest = module.initRequest;
      if (initRequest) {
        try {
          await initRequest(kitEvent, op);
        }
        catch (error) {
          module.log.error(error);
        }
      }
    }
  };

  const handleApi = !building
    ? async (remult: Remult) => {
      for (const module of modulesSorted) {
        const initApi = module.initApi;
        if (initApi) {
          try {
            await initApi(remult);
          }
          catch (error) {
            module.log.error(error);
          }
        }
      }
    }
    : async () => {};

  return remultSveltekit({
    logApiEndPoints: true,
    admin: true,
    defaultGetLimit: 25,
    error:
      options.error
      ?? (async (error: RemultError) => {
        if (error.httpStatusCode === 400) {
          error.sendError(409, error.responseBody);
        }
      }),
    ...options,
    entities: Array.from(entitiesMap.values()),
    controllers: Array.from(controllersMap.values()),
    initRequest: handleRequest,
    initApi: handleApi,
  });
}
