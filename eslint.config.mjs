import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test and generated files:
    "__tests__/**",
    "coverage/**",
    "jest.config.js",
    "jest.setup.js",
  ]),
  {
    // core-web-vitals가 이미 jsx-a11y 플러그인을 포함하므로 규칙만 오버라이드
    rules: {
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/aria-unsupported-elements": "error",
      // 모바일 앱이므로 off
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/interactive-supports-focus": "off",
      "jsx-a11y/label-has-associated-control": "warn",
      // 모바일 앱이므로 off
      "jsx-a11y/no-static-element-interactions": "off",
    },
  },
]);

export default eslintConfig;
