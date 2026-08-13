import neostandard from "neostandard";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  ...neostandard({
    env: ["node", "jest", "browser"],
    ignores: [],
  }),
  eslintConfigPrettier,
  {
    plugins: { sonarjs },
    rules: {
      "sonarjs/no-commented-code": "error",
    },
  },
];
