import idModel from "../model/idModel";
import limitAndSortDef from "../model/limitAndSortModel";
import userModel from "../model/userModel";
import { Karman } from "../super/karman";

export default class extends Karman {
  constructor(url) {
    super(url, "users");
  }

  getAllUsers = this.$createAPI({
    payloadDef: limitAndSortDef,
  });

  getUserById = this.$createAPI({
    payloadDef: idModel(true),
  });

  addUser = this.$createAPI({
    method: "POST",
    payloadDef: userModel(true),
  });

  deleteUerById = this.$createAPI({
    method: "DELETE",
    payloadDef: idModel(true),
  });
}
