import { defineKarman } from "@karman";
import fakeStore from "./src/fake-store";
import tpProject from "./src/tp-project";

export default defineKarman({
  root: true,
  headerMap: true,
  validation: true,
  route: {
    fakeStore,
    tpProject,
  },
});
