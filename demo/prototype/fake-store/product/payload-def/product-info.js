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
      body,
      rules: ["string", { required, min: 1, max: 20, measurement: "length" }],
    },
    /**
     * 價格
     * @min 1
     * @type {number}
     */
    price: {
      body,
      rules: ["number", { required, min: 1 }],
    },
    /**
     * 說明
     * @min 1
     * @max 100
     * @type {string}
     */
    description: {
      body,
      rules: ["string", { required, min: 1, max: 100, measurement: "length" }],
    },
    /**
     * 圖片
     * @max 5mb
     * @type {File}
     */
    image: {
      body,
      rules: [File, { required, measurement: "size", max: 1024 * 1024 * 5 }],
    },
  };

  return rule;
};
