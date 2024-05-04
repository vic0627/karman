import { defineSchemaType } from "@vic0627/karman";
import categorySchema from "./category-schema";

const required = true;

export default defineSchemaType("ProductInfo", {
  ...categorySchema.def,
  /**
   * product name
   * @min 1
   * @max 20
   * @type {string}
   */
  title: {
    required,
    rules: ["string", { min: 1, max: 20, measurement: "length" }],
  },
  /**
   * pricing
   * @min 1
   * @type {number}
   */
  price: {
    required,
    rules: ["number", { min: 1 }],
  },
  /**
   * description of product
   * @min 1
   * @max 100
   * @type {string}
   */
  description: {
    required,
    rules: ["string", { min: 1, max: 100, measurement: "length" }],
  },
  /**
   * product image
   * @max 5mb
   * @type {File}
   */
  image: {
    required,
    rules: [File, { measurement: "size", max: 1024 * 1024 * 5 }],
  },
});
