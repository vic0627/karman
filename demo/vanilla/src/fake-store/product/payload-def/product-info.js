import category from "./category";

export default (required) => {
  const body = true;
  const rule = {
    ...category(true, { body }),
    /**
     * 標題
     * @min 1
     * @max 20
     * @type {string}
     */
    title: {
      required,
      body,
      rules: ["string", { min: 1, max: 20, measurement: "length" }],
    },
    /**
     * 價格
     * @min 1
     * @type {number}
     */
    price: {
      required,
      body,
      rules: ["number", { min: 1 }],
    },
    /**
     * 說明
     * @min 1
     * @max 100
     * @type {string}
     */
    description: {
      required,
      body,
      rules: ["string", { min: 1, max: 100, measurement: "length" }],
    },
    /**
     * 圖片
     * @max 5mb
     * @type {File}
     */
    image: {
      required,
      body,
      rules: [File, { measurement: "size", max: 1024 * 1024 * 5 }],
    },
  };

  return rule;
};
