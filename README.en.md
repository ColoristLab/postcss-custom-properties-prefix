# postcss-custom-properties-prefix

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.tslang.org)
[![Test](https://img.shields.io/github/actions/workflow/status/ColoristLab/postcss-custom-properties-prefix/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColoristLab/postcss-custom-properties-prefix/actions/workflows/tests.yml)
[![codecov](https://codecov.io/github/ColoristLab/postcss-custom-properties-prefix/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColoristLab/postcss-custom-properties-prefix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColoristLab/postcss-custom-properties-prefix/blob/main/LICENSE)
---

English | [简体中文](./README.md)

A PostCSS plugin that uniformly adds prefixes to CSS custom properties (CSS Variables).

## Installation

```bash
npm install postcss-custom-properties-prefix
```

## Usage

Add the plugin to your PostCSS config:

```js
// postcss.config.mjs
import prefixCustomProperties from "postcss-custom-properties-prefix";

export default {
  plugins: [
    prefixCustomProperties({
      prefix: "app-",
      ignore: ["ignored", /^legacy-/],
    }),
  ],
};
```

## Transformation Example

**Input:**

```css
:root {
  --brand-color: #ff4757;
  --text-color: #333;
  --ignored: 42px;
}

.button {
  color: var(--brand-color);
  background: var(--text-color);
  padding: var(--ignored);
}
```

**Output:**

```css
:root {
  --app-brand-color: #ff4757;
  --app-text-color: #333;
  --ignored: 42px;
}

.button {
  color: var(--app-brand-color);
  background: var(--app-text-color);
  padding: var(--ignored);
}
```

The plugin keeps custom property declarations, `var()` references, and `@property` rules in sync, while preserving the original names of custom properties that match the ignore rules.

## Configuration Options

| Option   | Type                   | Default | Description                                    |
| -------- | ---------------------- | ------- | ---------------------------------------------- |
| `prefix` | `string`               | `''`    | The prefix to add, e.g. `app-`.                |
| `ignore` | `(string \| RegExp)[]` | `[]`    | Custom properties that should not be prefixed. |

`ignore` supports strings and regular expressions:

```js
prefixCustomProperties({
  prefix: "app-",
  ignore: [
    "--brand-color", // Supports names with the -- prefix
    "ignored", // Also supports names without --
    /^legacy-/, // Matches names starting with legacy-
  ],
});
```

Regular expressions are matched against both the full name (e.g. `--legacy-color`) and the name without `--` (e.g. `legacy-color`).

## Local Development

```bash
pnpm install
pnpm test
```
