import { defineCustomValidator, ValidationError } from "@vic0627/karman";
/**
 * @param {R} required
 * @template {boolean} R
 */
export default (required) => ({
  /**
   * 回傳筆數
   * @type {R extends true ? number : (number | void)}
   */
  limit: { required, query: true, rules: ["int", { min: 1, measurement: "self" }] },
  /**
   * 排序策略
   * @type {R extends true ? ("asc" | "desc") : ("asc" | "desc" | void)}
   */
  sort: {
    required,
    query: true,
    rules: [
      "string",
      defineCustomValidator((prop, value) => {
        if (!["asc", "desc"].includes(value)) throw new ValidationError(`parameter "${prop}" must be "asc" or "desc"`);
      }),
    ],
  },
});
