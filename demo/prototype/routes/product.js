const { defineKarman, defineAPI, defineIntersection } = require("../karman/karman.js");

const idRule = (descriptor = {}, ...rules) => defineIntersection("int", { ...descriptor, min: 1 }, ...rules);
const titleRule = (descriptor = {}, ...rules) =>
  defineIntersection("string", { ...descriptor, min: 1, max: 20, measurement: "length" }, ...rules);
const priceRule = (descriptor = {}, ...rules) => defineIntersection("number", { ...descriptor, min: 0 }, ...rules);

const limit = { query: true, rules: idRule() };

const sort = {
  query: true,
  rules: (_, value) => {
    if (value !== "desc" && value !== "asc") throw new TypeError('參數 "sort" 必須為 "desc" 或 "asc"。');
  },
};

module.exports = defineKarman({
  route: "products",
  api: {
    getAll: defineAPI({
      payloadDef: {
        limit,
        sort,
      },
    }),
    getById: defineAPI({
      payloadDef: {
        id: {
          path: 0,
          rules: idRule({ required: true }),
        },
      },
    }),
    create: defineAPI({
      method: "POST",
      payloadDef: {
        title: {
          body: true,
          rules: titleRule({ required: true }),
        },
        price: {
          body: true,
          rules: priceRule({ required: true }),
        },
        description: {
          body: true,
          rules: defineIntersection("string", { min: 1, max: 100, measurement: "length", required: true }),
        },
        image: {
          body: true,
          rules: defineIntersection(File, { max: 5 * 1024 * 1024, measurement: "size", required: true }),
        },
        category: {
          body: true,
          rules: ["string", { required: true }],
        },
      },
      getCategories: defineAPI({
        endpoint: "categories",
      }),
      getProductsIn: defineAPI({
        endpoint: "category",
        payloadDef: {
          limit,
          sort,
          category: {
            path: 0,
            rules: ["string", { required: true }],
          },
        },
      }),
    }),
  },
});
