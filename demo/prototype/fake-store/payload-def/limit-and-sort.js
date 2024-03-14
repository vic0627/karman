export default {
  /**
   * 回傳筆數
   * @type {number | undefined}
   */
  limit: { query: true, rules: ["int", { min: 1 }] },
  /**
   * 排序策略
   * @type {"asc" | "desc" | undefined}
   */
  sort: {
    query: true,
    rules: [
      "string",
      defineCustomValidator((prop, value) => {
        if (!["asc", "desc"].includes(value)) throw new TypeError(`parameter "${prop}" must be "asc" or "desc"`);
      }),
    ],
  },
};
