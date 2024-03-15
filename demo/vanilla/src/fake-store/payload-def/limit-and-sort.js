import { defineCustomValidator } from "@karman";
/**
 * @param {R} required
 * @template {boolean} R
 */
export default (required) => ({
  /**
   * 回傳筆數
   * @type {R extends true ? number : import("@/karman").Optional<number>}
   */
  limit: { query: true, rules: ["int", { min: 1, measurement: "self", required }] },
  /**
   * 排序策略
   * @type {R extends true ? "asc" | "desc" | undefined : import("@/karman").Optional<"asc" | "desc" | undefined>}
   */
  sort: {
    query: true,
    rules: [
      "string",
      defineCustomValidator((prop, value) => {
        if (!["asc", "desc"].includes(value)) throw new TypeError(`parameter "${prop}" must be "asc" or "desc"`);
      }),
      { required },
    ],
  },
});
