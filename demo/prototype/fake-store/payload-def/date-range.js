const query = true;

export const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;

export default (required) => ({
  /**
   * 起始日期
   * @type {string}
   */
  startdate: {
    query,
    rules: ["string", dateRegexp, { required }],
  },
  /**
   * 結束日期
   * @type {string}
   */
  enddate: {
    query,
    rules: ["string", dateRegexp, { required }],
  },
});
