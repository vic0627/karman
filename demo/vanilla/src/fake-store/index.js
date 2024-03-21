import { defineAPI, defineIntersectionRules, defineKarman, defineUnionRules } from "@karman";
import product from "./product";
import cart from "./cart";
import user from "./user";

export default defineKarman({
  url: "https://fakestoreapi.com",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  timeout: 0,
  api: {
    ruleSetTest: defineAPI({
      payloadDef: {
        /** @type {string | number} */
        param01: {
          rules: defineUnionRules("char", "string", "number"),
        },
        /** @type {number} */
        param02: {
          rules: defineIntersectionRules("int", "number"),
        },
      },
    }),
    stringTest: defineAPI({
      payloadDef: {
        /** @type {string} */
        param01: { rules: "char" },
        /** @type {string} */
        param02: { rules: "string" },
      },
    }),
    numberTest: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: { rules: "int" },
        /** @type {number} */
        param02: { rules: "number" },
      },
    }),
    objectTest: defineAPI({
      payloadDef: {
        /** @type {object} */
        param01: { rules: "object" },
        /** @type {object} */
        param02: { rules: "object-literal" },
        /** @type {any[]} */
        param03: { rules: "array" },
        /** @type {Funciton} */
        param04: { rules: "funciton" },
        /** @type {null} */
        param05: { rules: "null" },
      },
    }),
    /**
     * ### user login
     */
    login: defineAPI({
      endpoint: "auth/login",
      method: "POST",
      requestStrategy: "fetch",
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
