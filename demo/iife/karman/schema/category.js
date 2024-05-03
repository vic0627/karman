import { defineSchemaType, ValidationError, defineCustomValidator } from "../../../../dist/karman.js";

export default defineSchemaType("Category", {
  /**
   * category of products
   * @type {"electronics" | "jewelery" | "men's clothing" | "women's clothing"}
   */
  category: {
    rules: [
      "string",
      defineCustomValidator((_, value) => {
        if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
          throw new ValidationError("invalid category");
      }),
    ],
  },
});
