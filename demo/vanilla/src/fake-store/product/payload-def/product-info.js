import category from "./category";
/**
 * @param {R} required
 * @template {boolean} R
 */
export default (required) => {
  const body = true;
  const rule = {
    ...category(true, { body }),
    /**
     * 標題
     * @min 1
     * @max 20
     * @type {R extends true ? string : (string | void)}
     */
    title: {
      required,
      body,
      rules: ["string", { min: 1, max: 20, measurement: "length" }],
    },
    /**
     * 價格
     * @min 1
     * @type {R extends true ? number : (number | void)}
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
     * @type {R extends true ? string : (string | void)}
     */
    description: {
      required,
      body,
      rules: ["string", { min: 1, max: 100, measurement: "length" }],
    },
    /**
     * 圖片
     * @max 5mb
     * @type {R extends true ? File : (File | void)}
     */
    image: {
      required,
      body,
      rules: [File, { measurement: "size", max: 1024 * 1024 * 5 }],
    },
  };

  return rule;
};
