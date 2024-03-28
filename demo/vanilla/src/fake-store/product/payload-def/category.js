import { defineCustomValidator, ValidationError } from "@vic0627/karman";
import category from "../dto/dto-category";

/**
 * @param {R} required
 * @param {import('@vic0627/karman').ParamPosition} param02
 * @template {boolean} R
 */
export default (required, { path, query, body } = {}) => {
  const rule = {
    /**
     * 商品種類
     * @type {R extends true ? typeof category : (typeof category | void)}
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
