import { defineSchemaType, ValidationError, defineCustomValidator } from "../../../../dist/karman.js";
/**
 * @typedef {"electronics" | "jewelery" | "men's clothing" | "women's clothing"} Category
 */
export default defineSchemaType("Category", {
  /**
   * category of products
   */
  category: {
    rules: [
      "string",
      defineCustomValidator((_, value) => {
        if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
          throw new ValidationError("invalid category");
      }),
    ],
    /** @type {Category} */
    type: null,
  },
});
