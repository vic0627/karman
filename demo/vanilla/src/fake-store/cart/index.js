import { defineKarman, defineAPI } from "@vic0627/karman";
import limitAndSortSchema from "../schema/limit-and-sort-schema";
import dateRangeSchema from "../schema/date-range-schema";
import idSchema from "../schema/id-schema";
import cartSchema from "../schema/cart-schema";

export default defineKarman({
  url: "carts",
  api: {
    /**
     * ### Get all carts
     */
    getAll: defineAPI({
      payloadDef: {
        ...limitAndSortSchema
          .mutate()
          .setPosition("query")
          .setOptional()
          .setDefault("limit", () => 10).def,
        ...dateRangeSchema.mutate().setPosition("query").setOptional().def,
      },
      /** @type {typeof cartSchema.def[]} */
      dto: null,
    }),
    /**
     * ### get single cart by id
     */
    getById: defineAPI({
      url: ":id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {typeof cartSchema.def} */
      dto: null,
    }),
    /**
     * ### get single cart by user id
     */
    getUserCarts: defineAPI({
      url: "user/:id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {typeof cartSchema.def[]} */
      dto: null,
    }),
    /**
     * ### add a new cart
     */
    add: defineAPI({
      method: "POST",
      payloadDef: cartSchema.mutate().omit("id").def,
      /** @type {typeof cartSchema.def} */
      dto: null,
    }),
    /**
     * ### update a cart
     */
    update: defineAPI({
      url: ":id",
      method: "PUT",
      payloadDef: cartSchema.mutate().setPosition("path", "id").def,
      /** @type {typeof cartSchema.def} */
      dto: null,
    }),
    /**
     * ### modify a cart
     */
    modify: defineAPI({
      url: ":id",
      method: "PATCH",
      payloadDef: cartSchema.mutate().setPosition("path", "id").setOptional("date", "products", "userId").def,
      /** @type {typeof cartSchema.def} */
      dto: null,
    }),
    /**
     * delete a cart by id
     */
    delete: defineAPI({
      url: ":id",
      method: "DELETE",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {typeof cartSchema.def} */
      dto: null,
    }),
  },
});
