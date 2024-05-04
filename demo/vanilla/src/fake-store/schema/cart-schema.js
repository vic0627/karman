import { defineSchemaType } from "@vic0627/karman";
import idSchema from "./id-schema";

const required = true;

export const productsInCarSchema = defineSchemaType("ProductsInCar", {
  /**
   * @min 1
   * @type {number}
   */
  productId: {
    required,
    rules: ["int", { min: 1 }],
  },
  /**
   * @min 1
   * @type {number}
   */
  quantity: {
    required,
    rules: ["int", { min: 1 }],
  },
});

export default defineSchemaType("Cart", {
  ...idSchema.def,
  /**
   * @min 1
   * @type {number}
   */
  userId: {
    required,
    rules: ["int", { min: 1 }],
  },
  /**
   * @type {string}
   */
  date: {
    required,
    rules: "string",
  },
  /**
   * @type {typeof productsInCarSchema.def[]}
   */
  products: {
    required,
    rules: "ProductsInCar[]",
  },
});
