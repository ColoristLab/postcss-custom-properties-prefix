# postcss-custom-properties-prefix

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.tslang.org)
[![Test](https://img.shields.io/github/actions/workflow/status/ColoristLab/postcss-custom-properties-prefix/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColoristLab/postcss-custom-properties-prefix/actions/workflows/tests.yml)
[![codecov](https://codecov.io/github/ColoristLab/postcss-custom-properties-prefix/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColoristLab/postcss-custom-properties-prefix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColoristLab/postcss-custom-properties-prefix/blob/main/LICENSE)
---

简体中文 | [English](./README.en.md)

为 CSS 自定义属性（CSS Variables）统一添加前缀的 PostCSS 插件。

## 安装

```bash
npm install postcss-custom-properties-prefix
```

## 使用

在 PostCSS 配置中添加插件：

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

## 转换示例

**输入：**

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

**输出：**

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

插件会同步处理自定义属性声明、`var()` 引用和 `@property` 规则，并保留匹配忽略规则的原始名称。

## 配置选项

| 选项     | 类型                   | 默认值 | 说明                         |
| -------- | ---------------------- | ------ | ---------------------------- |
| `prefix` | `string`               | `''`   | 要添加的前缀，例如 `app-`。  |
| `ignore` | `(string \| RegExp)[]` | `[]`   | 不需要添加前缀的自定义属性。 |

`ignore` 支持字符串和正则表达式：

```js
prefixCustomProperties({
  prefix: "app-",
  ignore: [
    "--brand-color", // 支持带 -- 前缀的名称
    "ignored", // 也支持不带 -- 的名称
    /^legacy-/, // 匹配 legacy- 开头的名称
  ],
});
```

正则表达式会同时匹配完整名称（如 `--legacy-color`）和去掉 `--` 的名称（如 `legacy-color`）。

## 本地开发

```bash
pnpm install
pnpm test
```
