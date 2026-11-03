import base from "../../packages/config/eslint.config.js";

export default [
  ...base,
{
  files: ["src/**/*.ts"],
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
    globals: {
      process: "readonly",
      console: "readonly",
    },
  },
},
];
