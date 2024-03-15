import { defineCustomValidator } from "@karman";
import { dateRegexp } from "../../payload-def/date-range"; 
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
    body,
    rules: ["int", { required, min: 1, measurement: "self" }],
  },
  /**
   * update date
   * @type {string}
   */
  date: {
    body,
    rules: ["string", dateRegexp, { required }],
  },
  /**
   * products
   * @type {dtoCartProduct[]}
   */
  products: {
    body,
    rules: [
      "array",
      defineCustomValidator((_, value) => {
        value.forEach(({ productId, quantity }) => {
          if (typeof productId !== "number" || productId < 1) throw new Error("'productId' must be a positive number.");
          if (typeof quantity !== "number" || quantity < 1) throw new Error("'quantity' must be a positive number.");
        });
      }),
      { required },
    ],
  },
};
