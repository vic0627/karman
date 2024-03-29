import { defineKarman, defineAPI } from "@vic0627/karman";
import limitAndSort from "../payload-def/limit-and-sort";
import id from "../payload-def/id";
import dateRange from "../payload-def/date-range";
import dtoCart from "./dto/dto-cart";
import cart from "./payload-def/cart";

export default defineKarman({
  url: "carts",
  api: {
    /**
     * ### 取得所有購物車
     */
    getAll: defineAPI({
      payloadDef: {
        ...limitAndSort(true),
        ...dateRange(true),
      },
      dto: [dtoCart],
    }),
    /**
     * ### get single cart by id
     */
    getById: defineAPI({
      payloadDef: {
        ...id(true, { path: 0 }),
      },
      dto: dtoCart,
    }),
    /**
     * ### get single cart by user id
     */
    getUserCarts: defineAPI({
      url: "user",
      payloadDef: {
        ...id(true, { path: 0 }),
      },
      dto: [dtoCart],
    }),
    /**
     * ### add a new cart
     */
    add: defineAPI({
      method: "POST",
      payloadDef: cart,
    }),
    /**
     * ### update a cart
     */
    update: defineAPI({
      method: "PUT",
      payloadDef: {
        ...id(true, { path: 0 }),
        ...cart,
      },
    }),
    /**
     * ### modify a cart
     */
    modify: defineAPI({
      method: "PATCH",
      payloadDef: {
        ...id(true, { path: 0 }),
        ...cart,
      },
    }),
    /**
     * delete a cart by id
     */
    delete: defineAPI({
      method: "DELETE",
      payloadDef: id(true, { path: 0 }),
    }),
  },
});
