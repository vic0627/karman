export default (required, { path, query, body } = {}) => {
  const rule = {
    /**
     * identifier
     * @min 1
     * @type {number}
     */
    id: { rules: ["int", { min: 1, required }] },
  };

  if (path !== undefined) rule.id.path = path;
  if (query !== undefined) rule.id.query = query;
  if (body !== undefined) rule.id.body = body;

  return rule;
};
