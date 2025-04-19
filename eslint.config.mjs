import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "app",
    svelte: true,
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
    ignores: ["src/lib/components/ui/**"],
  },
  {
    rules: {
      "ts/no-redeclare": "off",
      "ts/consistent-type-definitions": "off",
      "no-console": "warn",
      "antfu/no-top-level-await": "off",
      "node/prefer-global/process": "off",
      "perfectionist/sort-imports": "off",
      "prefer-const": "off",
      "prefer-template": "off",
      "no-unused-expressions": "off",
      "unused-imports/no-unused-imports": "warn",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: ["README.md", "ROUTES.ts"],
        },
      ],
    },
  },
);
