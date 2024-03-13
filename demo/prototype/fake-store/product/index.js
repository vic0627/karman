import { defineKarman, defineAPI, defineCustomValidator } from "karman";
import limitAndSort from "./payload-def/limit-and-sort";
import productInfo from "./dto/product-info";
import category from "./dto/category";

export default defineKarman({
  url: "products",
  api: {
    /**
     * ### 取得所有商品
     */
    getAllProducts: defineAPI({
      payloadDef: limitAndSort,
      dto: [productInfo],
      requestStrategy: "fetch",
      onSuccess(res) {
        return res.json();
      },
      onBeforeRequest(_, payload) {
        if (!payload.limit) payload.limit = 10;
      },
    }),
    /**
     * ### 依商品編號取得商品
     */
    getSingleProduct: defineAPI({
      payloadDef: {
        /**
         * 商品編號
         * @min 1
         * @type {number}
         */
        id: { path: 0, rules: ["int", { min: 1, required: true }] },
      },
      dto: productInfo,
    }),
    /**
     * ### 取得所有商品種類
     */
    getAllCategories: defineAPI({
      endpoint: "categories",
      /** @type {Array<category>} */
      dto: [],
    }),
    /**
     * ### 依商品種類搜尋商品
     */
    getProductsFromCategories: defineAPI({
      endpoint: "category",
      payloadDef: {
        /**
         * 商品種類
         * @type {category}
         */
        category: {
          path: 0,
          rules: [
            "string",
            defineCustomValidator((_, value) => {
              if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
                throw new TypeError("invalid category");
            }),
          ],
        },
      },
    }),
  },
});
