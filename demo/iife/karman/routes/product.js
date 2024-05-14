import { defineKarman, defineAPI } from "../../../../dist/karman.js";

export default defineKarman({
  url: "products",
  api: {
    getAll: defineAPI({
      onSuccess(res) {
        return this._getData(res);
      },
    }),
  },
});
