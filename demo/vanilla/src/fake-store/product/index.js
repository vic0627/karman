import { defineKarman, defineAPI } from "@vic0627/karman";
import limitAndSort from "../payload-def/limit-and-sort";
import dtoProductInfo from "./dto/dto-product-info";
import dtoCategory from "./dto/dto-category";
import category from "./payload-def/category";
import productInfo from "./payload-def/product-info";
import imageBase64 from "../../utils/imageBase64";
import id from "../payload-def/id";

async function convertImage(_, payload) {
  payload.image = await imageBase64(payload.image);
}

export default defineKarman({
  url: "products",
  api: {
    /**
     * ### get all products
     */
    getAll: defineAPI({
      payloadDef: limitAndSort(false),
      dto: [dtoProductInfo],
      onBeforeRequest(_, payload) {
        if (!payload.limit) payload.limit = 10;
      },
      requestStrategy: "fetch"
    }),
    /**
     * ### get single product by id
     */
    getById: defineAPI({
      payloadDef: {
        ...id(true, { path: 0 }),
      },
      dto: dtoProductInfo,
      requestStrategy: "fetch",
      onSuccess(res) {
        return res.body
      }
    }),
    /**
     * ### create a new product
     */
    create: defineAPI({
      method: "POST",
      payloadDef: {
        ...productInfo(true),
      },
      dto: dtoProductInfo,
    }),
    /**
     * ### update single product
     */
    update: defineAPI({
      method: "PUT",
      payloadDef: {
        ...id(true, { path: 0 }),
        ...productInfo(true),
      },
      dto: dtoProductInfo,
      onBeforeRequest: convertImage,
    }),
    /**
     * ### modify single product
     */
    modify: defineAPI({
      method: "PATCH",
      payloadDef: {
        ...id(true, { path: 0 }),
        ...productInfo(false),
      },
      dto: dtoProductInfo,
      onBeforeRequest: convertImage,
    }),
    /**
     * ### delete a product
     */
    delete: defineAPI({
      method: "DELETE",
      payloadDef: {
        ...id(true, { path: 0 }),
      },
      dto: dtoProductInfo,
    }),
    /**
     * ### get all product's categories
     */
    getCategories: defineAPI({
      endpoint: "categories",
      /** @type {Array<dtoCategory>} */
      dto: [],
    }),
    /**
     * ### get products by category
     */
    getProductsByCategory: defineAPI({
      endpoint: "category",
      payloadDef: {
        ...category(true, { path: 0 }),
      },
    }),
  },
});
