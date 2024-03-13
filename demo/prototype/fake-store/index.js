import { defineKarman, defineAPI, defineCustomValidator, defineIntersectionRules, defineUnionRules } from "karman";
import product from "./product";


/**
 * # fakestore api
 */
const fakestore = defineKarman({
  url: "https://fakestoreapi.com",
  validation: true,
  route: {
    /**
     * ## 商品管理
     */
    product,
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

export default fakestore;