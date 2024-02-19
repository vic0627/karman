import { accountModel } from "../model/userModel";
import { Karman } from "../super/karman";

export default class extends Karman {
  constructor(url) {
    super(url, "auth");
  }

  /**
   * 登入
   * @param {string} payload.username
   * @param {string} payload.password
   */
  login = this.$createAPI({
    method: "POST",
    payloadDef: accountModel(true),
  });
}
