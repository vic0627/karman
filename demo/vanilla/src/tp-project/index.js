import { defineAPI, defineKarman, defineUnionRules } from "@karman";

const api = {
  /**
   * ### get const file
   */
  getConstFile: defineAPI({
    endpoint: "CMB/Get_Const_File",
    payloadDef: {
      /** @type {number} */
      proj_id: { path: 0, rules: { min: 1, required: true } },
      /** @type {string} */
      stage_id: { path: 1, rules: "string" },
      /** @type {string} */
      stp_id: { path: 2, rules: "string" },
      /** @type {string | number} */
      audit_id: { path: 3, rules: defineUnionRules("string", "number", "undefined") },
      test: { rules: Date },
    },
  }),
};

export default defineKarman({
  url: "https://demo.srgeo.com.tw/TP_PROJECT_SV/api/v1/",
  headers: {
    Accesstoken: "$2y$10$VVBw6w93JNFn3K50nfGlKuLyDZYHNOAo5yjjEyiQO0zYCeX.kjk8C",
    Aum_id: "1578",
  },
  api,
});
