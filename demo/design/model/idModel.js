export default (required) => {
  const def = {
    id: {
      path: 1,
      rules: ["number", "min=0"],
    },
  };

  if (required) {
    def.rules.push("required");
  }

  return def;
};
