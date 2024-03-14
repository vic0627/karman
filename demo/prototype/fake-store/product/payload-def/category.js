import { defineCustomValidator } from "@/node_modules_/karman";
import category from "../dto/dto-category";

export default (required, { path, query, body } = {}) => {
  const rule = {
    /**
     * 商品種類
     * @type {category}
     */
    category: {
      rules: [
        "string",
        defineCustomValidator((_, value) => {
          if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
            throw new TypeError("invalid category");
        }),
        { required },
      ],
    },
  };

  if (path !== undefined) rule.category.path = path;
  if (query !== undefined) rule.category.query = query;
  if (body !== undefined) rule.category.body = body;

  return rule;
};
