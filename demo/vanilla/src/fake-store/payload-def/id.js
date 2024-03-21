export default (required, { path, query, body } = {}) => {
  const rule = {
    /**
     * identifier
     * @min 1
     * @type {number}
     */
    id: { required, rules: ["int", { min: 1, measurement: "self" }] },
  };

  if (path !== undefined) rule.id.path = path;
  if (query !== undefined) rule.id.query = query;
  if (body !== undefined) rule.id.body = body;

  return rule;
};
