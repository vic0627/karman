import { defineCustomValidator, ValidationError } from "@karman";
import category from "../dto/dto-category";

export default (required, { path, query, body } = {}) => {
  const rule = {
    /**
     * 商品種類
     * @type {category}
     */
    category: {
      required,
      rules: [
        "string",
        defineCustomValidator((_, value) => {
          if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
            throw new ValidationError("invalid category");
        }),
      ],
    },
  };

  if (path !== undefined) rule.category.path = path;
  if (query !== undefined) rule.category.query = query;
  if (body !== undefined) rule.category.body = body;

  return rule;
};
