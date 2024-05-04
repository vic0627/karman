import { defineKarman, defineAPI } from "@vic0627/karman";
import limitAndSortSchema from "../schema/limit-and-sort-schema";
import idSchema from "../schema/id-schema";
import productInfoSchema from "../schema/product-info-schema";
import categorySchema from "../schema/category-schema";

/**
 * @typedef {typeof idSchema.def & typeof productInfoSchema.def} Product
 */

export default defineKarman({
  url: "products",
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
      /** @type {Product[]} */
      dto: null,
      requestStrategy: "fetch",
    }),
    /**
     * ### get single product by id
     */
    getById: defineAPI({
      url: ":id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {Product} */
      dto: null,
    }),
    /**
     * ### create a new product
     */
    create: defineAPI({
      method: "POST",
      payloadDef: productInfoSchema.def,
      /** @type {Product} */
      dto: null,
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
      /** @type {Product} */
      dto: null,
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
      /** @type {Product} */
      dto: null,
    }),
    /**
     * ### delete a product
     */
    delete: defineAPI({
      url: ":id",
      method: "DELETE",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {Product} */
      dto: null,
    }),
    /**
     * ### get all product's categories
     */
    getCategories: defineAPI({
      url: "categories",
      /** @type {Array<typeof categorySchema.def.category>} */
      dto: null,
    }),
    /**
     * ### get products by category
     */
    getProductsByCategory: defineAPI({
      url: "category/:category",
      payloadDef: categorySchema.mutate().setPosition("path").def,
      /** @type {Product[]} */
      dto: null,
    }),
  },
});
