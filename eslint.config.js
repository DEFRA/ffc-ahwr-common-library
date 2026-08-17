import neostandard from "neostandard";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  ...neostandard({
    env: ["node", "jest", "browser"],
    ignores: [],
  }),
  eslintConfigPrettier,
  sonarjs.configs.recommended,
  {
    rules: {
      "sonarjs/no-commented-code": "error",
    },
  },
];
