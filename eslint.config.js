import js from "@eslint/js";

// Configuration ESLint au format plat (ESLint 9). On part de la base recommandee
// et on declare les variables globales de Node et du navigateur que l'on utilise.
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
