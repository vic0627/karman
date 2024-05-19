import { defineSchemaType, defineCustomValidator, ValidationError, getType } from "../../../../dist/karman.js";

const required = true;
/** @type {("electronics" | "jewelery" | "men's clothing" | "women's clothing")[]} */
const categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];

export default defineSchemaType("ProductInfo", {
  /**
   * product name
   * @min 1
   * @max 20
   */
  title: {
    required,
    rules: ["string", { min: 1, max: 20, measurement: "length" }],
    type: "",
  },
  /**
   * pricing
   * @min 1
   */
  price: {
    required,
    rules: ["number", { min: 1 }],
    type: 1,
  },
  /**
   * description of product
   * @min 1
   * @max 100
   */
  description: {
    required,
    rules: ["string", { min: 1, max: 100, measurement: "length" }],
    type: "",
  },
  /**
   * product image
   */
  image: {
    required,
    rules: "string",
    type: "",
  },
  /**
   * category of products
   */
  category: {
    required: true,
    rules: [
      "string",
      defineCustomValidator((_, value) => {
        if (!categories.includes(value)) throw new ValidationError("invalid category");
      }),
    ],
    type: getType(...categories),
  },
});
