import { defineSchemaType } from "../../../../dist/karman.js";
import category from "./category.js";

export default defineSchemaType("Product", {
  /**
   * name of the product
   * @min 1
   * @max 20
   * @type {string}
   */
  title: {
    rules: ["string", { min: 1, max: 20, measurement: "length" }],
  },
  /**
   * price
   * @min 1
   * @type {number}
   */
  price: {
    rules: ["number", { min: 1 }],
  },
  /**
   * description
   * @min 1
   * @max 100
   * @type {string}
   */
  description: {
    rules: ["string", { min: 1, max: 100, measurement: "length" }],
  },
  /**
   * image
   * @max 5MiB
   * @type {File}
   */
  image: {
    rules: [File, { measurement: "size", max: 1024 * 1024 * 5 }],
  },
  ...category.def,
});
