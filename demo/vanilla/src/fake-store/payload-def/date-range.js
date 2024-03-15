const query = true;

export const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;
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
    query,
    rules: ["string", dateRegexp, { required }],
  },
  /**
   * 結束日期
   * @format "YYYY-MM-DD"
   * @type {R extends true ? string :import("@/karman"). Optional<string>}
   */
  enddate: {
    query,
    rules: ["string", dateRegexp, { required }],
  },
});
