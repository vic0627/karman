import { defineAPI, defineKarman } from "../../../dist/karman.js";
import product from "./route/product.js";
import cart from "./route/cart.js";
import user from "./route/user.js";
import limitAndSortSchema from "./schema/limit-and-sort-schema.js";
import idSchema from "./schema/id-schema.js";
import dateRangeSchema from "./schema/date-range-schema.js";
import Time from "./deps/time.js";

const fakeStore = defineKarman({
  headerMap: true,
  validation: true,
  scheduleInterval: 1000 * 10,
  schema: [limitAndSortSchema, idSchema, dateRangeSchema],
  // cache: true,
  cacheExpireTime: 5000,
  // timeout: 100,
  // timeoutErrorMessage: "error~~~",
  url: "https://fakestoreapi.com",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    from: "parent",
  },
  onResponse() {
    console.log(this._time.now);
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

fakeStore.$mount(window);
fakeStore.$use(new Time());

export default fakeStore;
