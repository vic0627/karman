import { defineKarman } from "@karman";
import fakeStore from "./src/fake-store";
import tpProject from "./src/tp-project";
import constant from "./src/utils/constant";

const rootKarman = defineKarman({
  root: true,
  headerMap: true,
  validation: true,
  scheduleInterval: 1000 * 10,
  // cache: true,
  cacheExpireTime: 5000,
  // timeout: 100,
  // timeoutErrorMessage: "error~~~",
  onRequest(req) {
    // console.log("onRequest", req);
    console.log(this._constant.min);
  },
  onResponse(res) {
    // console.log("onResponse", res);
  },
  route: {
    fakeStore,
    tpProject,
  },
});

rootKarman.$use(constant);

export default rootKarman;
