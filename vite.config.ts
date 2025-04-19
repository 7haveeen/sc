import type { KIT_ROUTES } from "$lib/ROUTES";

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { kitRoutes } from "vite-plugin-kit-routes";
import { stripper } from "vite-plugin-stripper";

export default defineConfig({
  plugins: [
    stripper({
      strip: [
        { decorator: "BackendMethod" },
        {
          decorator: "Entity",
          args_1: [
            { fn: "backendPrefilter" },
            { fn: "backendPreprocessFilter" },
            { fn: "sqlExpression" },
          ],
        },
      ],
    }),
    kitRoutes<KIT_ROUTES>({
      LINKS: {
        twitter: "https://twitter.com/7haveeen",
      },
    }),
    sveltekit(),
  ],
});
