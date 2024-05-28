import { defineKarman, defineAPI, getType } from "../../../../dist/karman.js";
import limitAndSortSchema from "../schema/limit-and-sort-schema.js";
import idSchema from "../schema/id-schema.js";
import productInfoSchema from "../schema/product-info-schema.js";

export default defineKarman({
  url: "products",
  schema: [productInfoSchema],
  api: {
    /**
     * ### get all products
     */
    getAll: defineAPI({
      payloadDef: limitAndSortSchema
        .mutate()
        .setOptional()
        .setPosition("query")
        .setDefault("limit", () => 10).def,
      dto: getType([productInfoSchema.def]),
      requestStrategy: "fetch",
    }),
    /**
     * ### get single product by id
     */
    getById: defineAPI({
      url: ":id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      dto: getType(productInfoSchema.def),
    }),
    /**
     * ### create a new product
     */
    create: defineAPI({
      method: "POST",
      payloadDef: productInfoSchema.def,
      dto: getType(productInfoSchema.def),
    }),
    /**
     * ### update single product
     */
    update: defineAPI({
      url: ":id",
      method: "PUT",
      payloadDef: {
        ...idSchema.mutate().setPosition("path").def,
        ...productInfoSchema.def,
      },
      dto: getType(productInfoSchema.def),
    }),
    /**
     * ### modify single product
     */
    modify: defineAPI({
      url: ":id",
      method: "PATCH",
      payloadDef: {
        ...idSchema.mutate().setPosition("path").def,
        ...productInfoSchema.def,
      },
      dto: getType(productInfoSchema.def),
    }),
    /**
     * ### delete a product
     */
    delete: defineAPI({
      url: ":id",
      method: "DELETE",
      payloadDef: idSchema.mutate().setPosition("path").def,
      dto: getType(productInfoSchema.def),
    }),
    /**
     * ### get all product's categories
     */
    getCategories: defineAPI({
      url: "categories",
      dto: getType([productInfoSchema.def.category.type]),
    }),
    /**
     * ### get products by category
     */
    getProductsByCategory: defineAPI({
      url: "category/:category",
      payloadDef: productInfoSchema.mutate().pick("category").setPosition("path").def,
      dto: getType([productInfoSchema.def]),
    }),
  },
});
