import { defineSchemaType, ValidationError, defineCustomValidator, getType } from "../../../../dist/karman.js";
/**
 * @typedef {"electronics" | "jewelery" | "men's clothing" | "women's clothing"} Category
 */

/** @type {Category[]} */
const categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];

export default defineSchemaType("Category", {
  /**
   * category of products
   */
  category: {
    rules: [
      "string",
      defineCustomValidator((_, value) => {
        if (!categories.includes(value)) throw new ValidationError("invalid category");
      }),
    ],
    type: getType(categories, undefined),
  },
});
