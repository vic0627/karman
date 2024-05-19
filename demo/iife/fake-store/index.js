import { defineAPI, defineKarman } from "../../../dist/karman.js";
import product from "./route/product.js";
import cart from "./route/cart.js";
import user from "./route/user.js";
import userSchema, { addressSchema, geoSchema, nameSchema } from "./schema/user-schema.js";
import productInfoSchema from "./schema/product-info-schema.js";
import limitAndSortSchema from "./schema/limit-and-sort-schema.js";
import idSchema from "./schema/id-schema.js";
import dateRangeSchema from "./schema/date-range-schema.js";
import cartSchema, { productsInCarSchema } from "./schema/cart-schema.js";

const fakeStore = defineKarman({
  root: true,
  headerMap: true,
  validation: true,
  scheduleInterval: 1000 * 10,
  schema: [
    userSchema,
    geoSchema,
    addressSchema,
    nameSchema,
    productInfoSchema,
    limitAndSortSchema,
    idSchema,
    dateRangeSchema,
    productsInCarSchema,
    cartSchema,
  ],
  // cache: true,
  cacheExpireTime: 5000,
  // timeout: 100,
  // timeoutErrorMessage: "error~~~",
  url: "https://fakestoreapi.com",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    from: "parent",
  },
  api: {
    /**
     * ### user login
     */
    login: defineAPI({
      url: "auth/login",
      method: "POST",
      requestStrategy: "fetch",
      payloadDef: ["username", "password"],
      // payloadDef: userSchema.mutate().pick("username", "password").def,
      /**
       * @typedef {object} LoginRes
       * @prop {string} LoginRes.token token of user account
       */
      /**
       * @type {LoginRes}
       */
      dto: null,
    }),
  },
  route: {
    /**
     * ## product management
     */
    product,
    /**
     * ## product cart management
     */
    cart,
    /**
     * ## user management
     */
    user,
  },
});

export default fakeStore;
