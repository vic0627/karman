import { defineCustomValidator, ValidationError } from "@vic0627/karman";
import { dateRule } from "../../payload-def/date-range";
import dtoCartProduct from "../dto/dto-cart-product";

const body = true;
const required = true;

export default {
  /**
   * identifer of user
   * @min 1
   * @type {number}
   */
  userId: {
    required,
    body,
    rules: ["int", { min: 1 }],
  },
  /**
   * update date
   * @type {string}
   */
  date: {
    required,
    body,
    rules: ["string", dateRule],
  },
  /**
   * products
   * @type {dtoCartProduct[]}
   */
  products: {
    required,
    body,
    rules: [
      "array",
      defineCustomValidator((_, value) => {
        value.forEach(({ productId, quantity }) => {
          if (typeof productId !== "number" || productId < 1)
            throw new ValidationError("'productId' must be a positive number.");
          if (typeof quantity !== "number" || quantity < 1)
            throw new ValidationError("'quantity' must be a positive number.");
        });
      }),
    ],
  },
};
