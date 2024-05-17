import { defineKarman, defineAPI, getType } from "../../../../dist/karman.js";
import product from "../schema/product.js";

export default defineKarman({
  url: "products",
  api: {
    getAll: defineAPI({
      onSuccess(res) {
        return this._getData(res);
      },
      dto: getType([product.def]),
    }),
  },
});
