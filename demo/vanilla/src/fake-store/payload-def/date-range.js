const query = true;

export const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;

export const dateRule = { regexp: dateRegexp, errorMessage: "invalid date format" };
/**
 * @param {R} required
 * @template {boolean} R
 */
export default (required) => ({
  /**
   * 起始日期
   * @format "YYYY-MM-DD"
   * @type {R extends true ? string : import("@/karman").Optional<string>}
   */
  startdate: {
    required,
    query,
    rules: ["string", dateRule],
  },
  /**
   * 結束日期
   * @format "YYYY-MM-DD"
   * @type {R extends true ? string :import("@/karman"). Optional<string>}
   */
  enddate: {
    required,
    query,
    rules: ["string", dateRule],
  },
});
