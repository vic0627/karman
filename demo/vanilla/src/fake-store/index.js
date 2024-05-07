import { defineAPI, defineKarman } from "@vic0627/karman";
import product from "./product";
import cart from "./cart";
import user from "./user";
import _constant from "../utils/constant";
import convertToBase64 from "../utils/imageBase64";
import userSchema, { addressSchema, geoSchema, nameSchema } from "./schema/user-schema";
import productInfoSchema from "./schema/product-info-schema";
import limitAndSortSchema from "./schema/limit-and-sort-schema";
import idSchema from "./schema/id-schema";
import dateRangeSchema from "./schema/date-range-schema";
import categorySchema from "./schema/category-schema";
import cartSchema, { productsInCarSchema } from "./schema/cart-schema";

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
    categorySchema,
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
    from: "parent"
  },
  api: {
    /**
     * ### user login
     */
    login: defineAPI({
      url: "auth/login",
      method: "POST",
      requestStrategy: "fetch",
      // payloadDef: ["username", "password"],
      payloadDef: userSchema.mutate().pick("username", "password").def,
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

fakeStore.$use(_constant);
fakeStore.$use(convertToBase64);

export default fakeStore;
