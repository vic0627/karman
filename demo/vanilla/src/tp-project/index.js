import { defineAPI, defineKarman, defineUnionRules } from "@karman";

const api = {
  getScheduleExtend: defineAPI({
    endpoint: "EMB/Get_Schedule_Extend/B2.18/1970/19265",
  }),
};

export default defineKarman({
  url: "https://demo.srgeo.com.tw/TP_PROJECT_SV/api/v1/",
  headers: {
    Accesstoken: "$2y$10$3NZRLtQ0k0C2hMVvmSGQBOy/hg0SqKPIr7BEzi.SMBfeNZqfj9ShC",
    Aum_id: "972",
  },
  api,
});
