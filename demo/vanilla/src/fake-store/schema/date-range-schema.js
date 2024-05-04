import { defineSchemaType } from "@vic0627/karman";

const required = true;
export const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;
export const dateRule = { regexp: dateRegexp, errorMessage: "invalid date format" };

export default defineSchemaType("DateRange", {
  /**
   * start date
   * @format "YYYY-MM-DD"
   * @type {string}
   */
  startdate: {
    required,
    rules: ["string", dateRule],
  },
  /**
   * end date
   * @format "YYYY-MM-DD"
   * @type {string}
   */
  enddate: {
    required,
    rules: ["string", dateRule],
  },
});
