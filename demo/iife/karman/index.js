import {
  defineKarman,
  defineAPI,
  defineUnionRules,
  ValidationError,
  isValidationError,
  defineCustomValidator,
  defineSchemaType,
  defineIntersectionRules,
  getConst,
  getType,
} from "../../../dist/karman.js";
import category from "./schema/category.js";
import productSchema from "./schema/product.js";
import getData from "./utils/get-data.js";
import product from "./routes/product.js";

window.product = product;

const a = getType([productSchema.def]);
/** @type {import('../../../dist/karman').Schema<"products" | "id">} */
const b = {
  /**
   * products in an array
   */
  products: { rules: "Product[1:]", required: true },
  /**
   * identifier
   */
  id: {
    position: "path",
    required: true,
    rules: ["int", { min: 1 }],
    type: 1,
  },
};

const $karman = defineKarman({
  root: true,
  url: "https://fakestoreapi.com/",
  validation: true,
  schema: [productSchema, category],
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
         */
        id: {
          position: "path",
          required: true,
          rules: ["int", { min: 1 }],
          /** @type {number} */
          type: null,
        },
        ...productSchema.mutate().setPosition("body").setOptional().def,
      },
    }),
    schemaTest2: defineAPI({
      payloadDef: productSchema.def,
    }),
    schemaTest3: defineAPI({
      payloadDef: {
        /**
         * products in an array
         */
        products: { rules: "Product[1:]", required: true, type: getType([productSchema.def]) },
        /**
         * identifier
         */
        id: {
          position: "path",
          required: true,
          rules: ["int", { min: 1 }],
          type: 1,
        },
      },
    }),
    arrPayloadDefTest: defineAPI({
      payloadDef: ["id", "title", "image"],
    }),
  },
  route: {
    product,
  },
});

product.$use(getData);
$karman.$mount(window);

export default $karman;
