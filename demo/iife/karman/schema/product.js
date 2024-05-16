import { defineSchemaType } from "../../../../dist/karman.js";
import category from "./category.js";

export default defineSchemaType("Product", {
  /**
   * name of the product
   * @min 1
   * @max 20
   */
  title: {
    rules: ["string", { min: 1, max: 20, measurement: "length" }],
    required: true,
    type: "",
  },
  /**
   * price
   * @min 1
   */
  price: {
    rules: ["number", { min: 1 }],
    required: true,
    type: 0,
  },
  /**
   * description
   * @min 1
   * @max 100
   */
  description: {
    rules: ["string", { min: 1, max: 100, measurement: "length" }],
    required: true,
    type: "",
  },
  /**
   * image
   */
  image: {
    rules: "string",
    required: true,
    type: "",
  },
  ...category.def,
});
