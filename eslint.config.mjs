import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  {
    files: ["popup.js"],
    languageOptions: {
      sourceType: "script",
      globals: { ...globals.browser, chrome: "readonly" },
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
];
