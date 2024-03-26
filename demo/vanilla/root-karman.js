import { defineKarman } from "@karman";
import fakeStore from "./src/fake-store";
import tpProject from "./src/tp-project";

export default defineKarman({
  root: true,
  headerMap: true,
  validation: true,
  scheduleInterval: 1000 * 10,
  // cache: true,
  cacheExpireTime: 5000,
  // timeout: 100,
  // timeoutErrorMessage: "error~~~",
  onRequest(req) {
    console.log("onRequest", req);
  },
  onResponse(res) {
    console.log("onResponse", res);
  },
  route: {
    fakeStore,
    tpProject,
  },
});
