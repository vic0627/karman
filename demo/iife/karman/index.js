import {
  defineKarman,
  defineAPI,
  defineUnionRules,
  ValidationError,
  isValidationError,
  defineCustomValidator,
  defineSchemaType,
  defineIntersectionRules,
} from "../../../dist/karman.js";
import product from "./schema/product.js";

const $karman = defineKarman({
  root: true,
  url: "https://fakestoreapi.com/",
  validation: true,
  // schema: [product],
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  api: {
    schemaTest: defineAPI({
      url: "products/:id",
      method: "PUT",
      payloadDef: {
        /**
         * @min 1
         * @type {number}
         */
        id: {
          position: "path",
          required: true,
          rules: ["int", { min: 1 }],
        },
        ...product.attach().setPosition("body").def,
      },
    }),
    schemaTest2: defineAPI({
      payloadDef: product.attach().setRequired().def,
    }),
  },
});

$karman.$mount(window);

export default $karman;
