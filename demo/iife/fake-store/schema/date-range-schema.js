import { defineSchemaType } from "../../../../dist/karman.js";

const required = true;
export const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;
export const dateRule = { regexp: dateRegexp, errorMessage: "invalid date format" };

export default defineSchemaType("DateRange", {
  /**
   * start date
   * @format "YYYY-MM-DD"
   */
  startdate: {
    required,
    rules: ["string", dateRule],
    type: "",
  },
  /**
   * end date
   * @format "YYYY-MM-DD"
   */
  enddate: {
    required,
    rules: ["string", dateRule],
    type: "",
  },
});
