import { defineAPI, defineKarman } from "@vic0627/karman";
import product from "./product";
import cart from "./cart";
import user from "./user";
import _constant from "../utils/constant";
import convertToBase64 from "../utils/imageBase64";

const fakeStore = defineKarman({
  root: true,
  headerMap: true,
  validation: true,
  scheduleInterval: 1000 * 10,
  // cache: true,
  cacheExpireTime: 5000,
  // timeout: 100,
  // timeoutErrorMessage: "error~~~",
  url: "https://fakestoreapi.com",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  api: {
    /**
     * ### user login
     */
    login: defineAPI({
      url: "auth/login",
      method: "POST",
      requestStrategy: "fetch",
      payloadDef: {
        /**
         * user name
         * @type {string}
         */
        username: {
          required: true,
          body: true,
          rules: ["string", { min: 1, measurement: "length" }],
        },
        /**
         * password
         * @type {string}
         */
        password: {
          required: true,
          body: true,
          rules: ["string", { min: 1, measurement: "length" }],
        },
      },
      onBeforeRequest(_, payload) {
        return JSON.stringify(payload);
      },
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
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
