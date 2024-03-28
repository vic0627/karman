/**
 * @param {R} required
 * @param {import('@vic0627/karman').ParamPosition} [param02={}]
 * @template {boolean} R
 */
export default (required, { path = -1, query = false, body = false } = {}) => ({
  /**
   * 編號
   * @min 1
   * @type {R extends true ? number : (number | void)}
   */
  id: {
    required,
    path,
    query,
    body,
    rules: ["int", { min: 1 }],
  },
});
