import idModel from "../model/idModel";
import limitAndSortDef from "../model/limitAndSortModel";
import dateModel from "../model/dateModel";
import { Karman } from "../super/karman";
import cartModel from "../model/cartModel";

export default class extends Karman {
  constructor(url) {
    super(url, "carts");
  }

  getAllCarts = this.$createAPI({
    payloadDef: { ...limitAndSortDef, ...dateModel },
  });

  getCartById = this.$createAPI({
    payloadDef: idModel(true),
  });

  getUserCart = this.$createAPI({
    endpoint: "user",
    payloadDef: idModel(true),
  });

  addProducts = this.$createAPI({
    method: "POST",
    payloadDef: cartModel,
  });

  updateProducts = this.$createAPI({
    method: "PUT",
    payloadDef: { ...cartModel, ...idModel(true) },
  });

  modifyProducts = this.$createAPI({
    method: "PATCH",
    payloadDef: { ...cartModel, ...idModel(true) },
  });

  deleteCartById = this.$createAPI({
    method: "DELETE",
    payloadDef: idModel(true),
  });
}
