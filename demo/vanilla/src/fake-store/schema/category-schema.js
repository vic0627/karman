import { defineSchemaType, defineCustomValidator, ValidationError } from "@vic0627/karman";

export default defineSchemaType("Category", {
  /**
   * category of products
   * @type {"electronics" | "jewelery" | "men's clothing" | "women's clothing"}
   */
  category: {
    required: true,
    rules: [
      "string",
      defineCustomValidator((_, value) => {
        if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
          throw new ValidationError("invalid category");
      }),
    ],
  },
});
