import idModel from "../model/idModel";
import limitAndSortDef from "../model/limitAndSortModel";
import productModel  from "../model/productModel";
import { Karman } from "../super/karman";

export default class extends Karman {
  constructor(url) {
    super(url, "products");
  }

  getAllProducts = this.$createAPI({
    payloadDef: limitAndSortDef,
  });

  getProductById = this.$createAPI({
    payloadDef: idModel(true),
  });

  getAllCategories = this.$createAPI({
    endpoint: "categories",
  });

  getProductByCategory = this.$createAPI({
    endpoint: "category",
    payloadDef: {
      ...limitAndSortDef,
      category: {
        path: 1,
        rules: ["required", "string"],
      },
    },
  });

  addNewProduct = this.$createAPI({
    method: "POST",
    payloadDef: productModel({ required: true }),
  });

  updateProductById = this.$createAPI({
    method: "PUT",
    payloadDef: {
      ...productModel(),
      ...idModel(true),
    },
  });

  modifyProductById = this.$createAPI({
    method: "PATCH",
    payloadDef: {
      ...productModel(),
      ...idModel(true),
    },
  });

  deleteProductById = this.$createAPI({
    method: "DELETE",
    payloadDef: idModel(true),
  });
}
