import { defineSchemaType, getType } from "../../../../dist/karman.js";
import idSchema from "./id-schema.js";

const required = true;

export const productsInCarSchema = defineSchemaType("ProductsInCar", {
  /**
   * @min 1
   */
  productId: {
    required,
    rules: ["int", { min: 1 }],
    type: 1
  },
  /**
   * @min 1
   */
  quantity: {
    required,
    rules: ["int", { min: 1 }],
    type: 1
  },
});

export default defineSchemaType("Cart", {
  ...idSchema.def,
  /**
   * @min 1
   */
  userId: {
    required,
    rules: ["int", { min: 1 }],
    type: 1
  },
  /**
   * date that the product had been added to cart
   */
  date: {
    required,
    rules: "string",
    type: ""
  },
  /**
   * products in cart
   */
  products: {
    required,
    rules: "ProductsInCar[]",
    type: getType([productsInCarSchema.def])
  },
});
