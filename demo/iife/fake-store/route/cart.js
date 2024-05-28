import { defineKarman, defineAPI, getType } from "../../../../dist/karman.js";
import limitAndSortSchema from "../schema/limit-and-sort-schema.js";
import idSchema from "../schema/id-schema.js";
import cartSchema, { productsInCarSchema } from "../schema/cart-schema.js";
import dateRangeSchema from "../schema/date-range-schema.js";

export default defineKarman({
  url: "carts",
  schema: [cartSchema, productsInCarSchema],
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
      dto: getType([cartSchema.def]),
    }),
    /**
     * ### get single cart by id
     */
    getById: defineAPI({
      url: ":id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      dto: getType(cartSchema.def),
    }),
    /**
     * ### get single cart by user id
     */
    getUserCarts: defineAPI({
      url: "user/:id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      dto: getType([cartSchema.def]),
    }),
    /**
     * ### add a new cart
     */
    add: defineAPI({
      method: "POST",
      payloadDef: cartSchema.mutate().omit("id").def,
      dto: getType(cartSchema.def),
    }),
    /**
     * ### update a cart
     */
    update: defineAPI({
      url: ":id",
      method: "PUT",
      payloadDef: cartSchema.mutate().setPosition("path", "id").def,
      dto: getType(cartSchema.def),
    }),
    /**
     * ### modify a cart
     */
    modify: defineAPI({
      url: ":id",
      method: "PATCH",
      payloadDef: cartSchema.mutate().setPosition("path", "id").setOptional("date", "products", "userId").def,
      dto: getType(cartSchema.def),
    }),
    /**
     * delete a cart by id
     */
    delete: defineAPI({
      url: ":id",
      method: "DELETE",
      payloadDef: idSchema.mutate().setPosition("path").def,
      dto: getType(cartSchema.def),
    }),
  },
});
