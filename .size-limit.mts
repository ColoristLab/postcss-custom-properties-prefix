import type { SizeLimitConfig } from "size-limit";

export default [
  {
    limit: "3KB",
    path: "./dist/index.mjs",
  },
] satisfies SizeLimitConfig;
