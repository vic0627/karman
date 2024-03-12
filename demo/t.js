import { defineKarman, defineAPI, defineCustomValidator, defineIntersectionRules, defineUnionRules } from "./index";

const limitAndSort = {
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

const productDTO = {
  /** 編號 */
  id: 1,
  /** 名稱 */
  title: "...",
  /** 價格 */
  price: "...",
  /** 種類 */
  category: "...",
  /** 說明 */
  description: "...",
  /** 圖片 */
  image: "...",
};

/**
 * @typedef {"electronics" | "jewelery" | "men's clothing" | "women's clothing"} Category
 */

/**
 * # API 抽象層
 */
const $k = defineKarman({
  baseURL: "https://fakestoreapi.com",
  validation: true,
  route: {
    /**
     * ## 商品管理
     */
    product: defineKarman({
      url: "products",
      api: {
        /**
         * ### 取得所有商品
         */
        getAllProducts: defineAPI({
          payloadDef: limitAndSort,
          dto: [productDTO],
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
          dto: productDTO,
          requestStrategy: "xhr",
        }),
        /**
         * ### 取得所有商品種類
         */
        getAllCategories: defineAPI({
          endpoint: "categories",
          /** @type {Array<Category>} */
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
             * @type {Category}
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
    }),
    /**
     * ## 購物車管理
     */
    cart: defineKarman({
      url: "carts",
      api: {
        getAllCarts: defineAPI({
          payloadDef: limitAndSort,
        }),
      },
    }),
  },
});

$k.product.getAllProducts({ sort: "asc" });
$k.product.getSingleProduct({ id: 3 });
