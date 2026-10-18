import postcss from "postcss";
import { describe, expect, it } from "vitest";

import prefixCustomProperties from "../src/index.js";

const transform = async (css: string, options = {}) => {
  const result = await postcss([prefixCustomProperties(options)]).process(css, {
    from: undefined,
  });

  console.log("PostCSS result:", result.css);

  return result.css;
};

describe("postcss-custom-properties-prefix", () => {
  describe("自定义属性声明", () => {
    it("应该为自定义属性声明添加前缀", async () => {
      const css = ":root { --color: red; --spacing: 1rem; }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ":root { --app-color: red; --app-spacing: 1rem; }",
      );
    });

    it("前缀为空时应该保留原有声明", async () => {
      const css = ":root { --color: red; }";

      await expect(transform(css)).resolves.toBe(css);
    });

    it("不应该修改普通 CSS 属性", async () => {
      const css = ".button { color: red; padding: 1rem; }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(css);
    });
  });

  describe("var() 变量引用", () => {
    it("应该为 var() 中的自定义属性添加前缀", async () => {
      const css = ".button { color: var(--color); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ".button { color: var(--app-color); }",
      );
    });

    it("应该同时修改属性声明和变量引用", async () => {
      const css = ":root { --color: red; } .button { color: var(--color); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ":root { --app-color: red; } .button { color: var(--app-color); }",
      );
    });

    it("应该处理嵌套的 var() 引用", async () => {
      const css = ".button { color: var(--color, var(--fallback)); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ".button { color: var(--app-color, var(--app-fallback)); }",
      );
    });

    it("应该处理其他函数内部的 var() 引用", async () => {
      const css = ".button { color: rgb(from var(--color) r g b); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ".button { color: rgb(from var(--app-color) r g b); }",
      );
    });

    it("应该保留回退值", async () => {
      const css = ".button { color: var(--color, red); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ".button { color: var(--app-color, red); }",
      );
    });

    it("应该保留 var() 内部的注释和空白", async () => {
      const css = ".button { color: var(/* comment */ --color); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        ".button { color: var(/* comment */ --app-color); }",
      );
    });

    it("不应该修改不包含 var() 的属性值", async () => {
      const css = ".button { color: red; background: #fff; }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(css);
    });
  });

  describe("@property 规则", () => {
    it("应该为 @property 规则中的自定义属性添加前缀", async () => {
      const css = '@property --color { syntax: "<color>"; inherits: true; initial-value: red; }';

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        '@property --app-color { syntax: "<color>"; inherits: true; initial-value: red; }',
      );
    });

    it("前缀为空时应该保留原有 @property 规则", async () => {
      const css = '@property --color { syntax: "<color>"; inherits: true; initial-value: red; }';

      await expect(transform(css)).resolves.toBe(css);
    });
  });

  describe("ignore 忽略规则", () => {
    it("应该根据属性名称忽略指定的自定义属性", async () => {
      const css = ":root { --color: red; --spacing: 1rem; }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: ["color"],
        }),
      ).resolves.toBe(":root { --color: red; --app-spacing: 1rem; }");
    });

    it("忽略规则应该支持带 -- 前缀的属性名称", async () => {
      const css = ":root { --color: red; --spacing: 1rem; }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: ["--color"],
        }),
      ).resolves.toBe(":root { --color: red; --app-spacing: 1rem; }");
    });

    it("应该忽略匹配指定名称的 var() 引用", async () => {
      const css = ".button { color: var(--color); margin: var(--spacing); }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: ["color"],
        }),
      ).resolves.toBe(".button { color: var(--color); margin: var(--app-spacing); }");
    });

    it("应该支持使用正则表达式忽略指定的自定义属性", async () => {
      const css = ":root { --bs-color: red; --app-color: blue; --spacing: 1rem; }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: [/^bs-/, /^app-/],
        }),
      ).resolves.toBe(":root { --bs-color: red; --app-color: blue; --app-spacing: 1rem; }");
    });

    it("应该根据属性名称忽略指定的 @property 规则", async () => {
      const css = '@property --color { syntax: "*"; inherits: true; }';

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: ["color"],
        }),
      ).resolves.toBe(css);
    });

    it("忽略规则为空数组时应该正常添加前缀", async () => {
      const css = ":root { --color: red; }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: [],
        }),
      ).resolves.toBe(":root { --app-color: red; }");
    });
  });

  describe("边界情况", () => {
    it("前缀为空字符串时不应该添加前缀", async () => {
      const css = ":root { --color: red; } .button { color: var(--color); }";

      await expect(transform(css, { prefix: "" })).resolves.toBe(css);
    });

    it("配置忽略规则后应该保留已经带有指定前缀的属性", async () => {
      const css = ":root { --app-color: red; }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: [/^app-/],
        }),
      ).resolves.toBe(css);
    });

    it("应该保留无关的 At-rule 规则", async () => {
      const css = "@media (min-width: 768px) { .button { color: var(--color); } }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(
        "@media (min-width: 768px) { .button { color: var(--app-color); } }",
      );
    });

    it("应该正确处理空 CSS", async () => {
      await expect(transform("", { prefix: "app-" })).resolves.toBe("");
    });

    it("应该忽略无效的忽略规则类型并正常添加前缀", async () => {
      const css = ":root { --color: red; }";

      await expect(
        transform(css, {
          prefix: "app-",
          ignore: [123 as unknown as string],
        }),
      ).resolves.toBe(":root { --app-color: red; }");
    });

    it("应该保留 var() 中只有注释且没有有效属性名称的内容", async () => {
      const css = ".button { color: var(/* comment */); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(css);
    });

    it("应该保留没有参数的 var() 函数", async () => {
      const css = ".button { color: var(); }";

      await expect(transform(css, { prefix: "app-" })).resolves.toBe(css);
    });
  });
});
