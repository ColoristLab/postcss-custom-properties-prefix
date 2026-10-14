import type { AtRule, Declaration, Plugin, Root } from "postcss";
import valueParser from "postcss-value-parser";

const pluginName = "postcss-custom-properties-prefix";

export interface Options {
  /**
   * 要添加的 CSS 自定义属性前缀。
   */
  prefix?: string;

  /**
   * 不需要添加前缀的自定义属性名称。
   *
   * 支持完整名称（例如 `--color` 或 `color`）
   * 以及正则表达式。
   */
  ignore?: (string | RegExp)[];
}

const normalizeOptions = (options: Options = {}) => {
  const prefix = typeof options.prefix === "string" ? options.prefix : "";
  const ignore = Array.isArray(options.ignore) ? options.ignore : [];

  return { prefix, ignore };
};

const normalizeCustomPropertyName = (name: string): string => {
  if (!name.startsWith("--")) {
    return `--${name}`;
  }

  return name;
};

const matchesIgnore = (name: string, ignorePatterns: (string | RegExp)[]): boolean => {
  const normalized = normalizeCustomPropertyName(name);

  return ignorePatterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(normalized) || pattern.test(normalized.slice(2));
    }

    if (typeof pattern === "string") {
      const normalizedPattern = normalizeCustomPropertyName(pattern);

      return normalizedPattern === normalized;
    }

    return false;
  });
};

const prefixCustomPropertyName = (name: string, prefix: string): string => {
  const normalized = normalizeCustomPropertyName(name);

  if (!prefix) {
    return normalized;
  }

  return `--${prefix}${normalized.slice(2)}`;
};

const transformDeclaration = (
  decl: Declaration,
  prefix: string,
  ignore: (string | RegExp)[],
): void => {
  if (decl.prop.startsWith("--") && !matchesIgnore(decl.prop, ignore)) {
    decl.prop = prefixCustomPropertyName(decl.prop, prefix);
  }

  const value = decl.raws.value?.raw ?? decl.value;

  if (value.includes("var(")) {
    const parsed = valueParser(value);
    let updated = false;

    parsed.walk((node) => {
      if (node.type !== "function" || node.value !== "var" || !node.nodes.length) {
        return;
      }

      const firstNode = node.nodes.find(
        (child) => child.type !== "comment" && child.type !== "space",
      );

      if (firstNode?.type !== "word") {
        return;
      }

      const customPropName = normalizeCustomPropertyName(firstNode.value);

      if (!matchesIgnore(customPropName, ignore)) {
        firstNode.value = prefixCustomPropertyName(customPropName, prefix);
        updated = true;
      }
    });

    if (updated) {
      decl.value = parsed.toString();
    }
  }
};

const transformAtRule = (atRule: AtRule, prefix: string, ignore: (string | RegExp)[]): void => {
  const params = atRule.params.trim();

  if (params.startsWith("--") && !matchesIgnore(params, ignore)) {
    atRule.params = prefixCustomPropertyName(params, prefix);
  }
};

const postcssPrefixCustomProperties = (options: Options = {}): Plugin => {
  const { prefix, ignore } = normalizeOptions(options);

  return {
    postcssPlugin: pluginName,

    Once(root: Root) {
      root.walkDecls((decl) => {
        transformDeclaration(decl, prefix, ignore);
      });

      root.walkAtRules("property", (atRule) => {
        transformAtRule(atRule, prefix, ignore);
      });
    },
  };
};

export default postcssPrefixCustomProperties;
