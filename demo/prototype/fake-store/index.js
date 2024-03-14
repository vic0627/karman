import { defineAPI, defineKarman } from "karman";
import product from "./product";
import cart from "./cart";
import user from "./user";

const fakestore = defineKarman({
  url: "https://fakestoreapi.com",
  api: {
    /**
     * ### user login
     */
    login: defineAPI({
      endpoint: "auth/login",
      method: "POST",
      payloadDef: {
        /**
         * user name
         * @type {string}
         */
        username: {
          body: true,
          rules: ["string", { required: true, min: 1, measurement: "length" }],
        },
        /**
         * password
         * @type {string}
         */
        password: {
          body: true,
          rules: ["string", { required: true, min: 1, measurement: "length" }],
        },
      },
      /**
       * @typedef {object} LoginRes
       * @prop {string} LoginRes.token
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

export default fakestore;

const [reqPromise] = fakestore.login({ username: "perse", password: "asdg" }, { onSuccess(res) {
  return res.config.headers
}});
const res = await reqPromise;