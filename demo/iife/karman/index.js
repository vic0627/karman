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
import category from "./schema/category.js";
import product from "./schema/product.js";

window.product = product;

const $karman = defineKarman({
  root: true,
  url: "https://fakestoreapi.com/",
  validation: true,
  schema: [product, category],
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
        ...product.mutate().setPosition("body").def,
      },
    }),
    schemaTest2: defineAPI({
      payloadDef: product.mutate().pick("price", "category").setRequired().def,
    }),
    schemaTest3: defineAPI({
      payloadDef: {
        /** @type {typeof product.def[]} */
        products: { rules: "Product[1:]", required: true },
      },
    }),
  },
});

$karman.$mount(window);

export default $karman;
