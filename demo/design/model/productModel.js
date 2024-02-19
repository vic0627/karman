/**
 * @param {object} param0
 * @param {boolean} [param0.required]
 * @param {string[]} [param0.pick]
 * @param {string[]} [param0.omit]
 */
export default ({ required, pick, omit }) => {
  const body = true;
  const def = {
    title: {
      body,
      rules: ["string"],
    },
    price: {
      body,
      rules: ["number", "min=0"],
    },
    description: {
      body,
      rules: ["string"],
    },
    image: {
      body,
      rules: ["string"],
    },
    category: {
      body,
      rules: ["string"],
    },
  };

  if (required) {
    for (const item of def) {
      item?.rules.push("required");
    }
  }

  if (pick?.length) {
    const copy = {};

    for (const key in def) {
      if (pick.includes(key)) {
        copy[key] = def[key];
      }
    }

    return copy;
  }

  if (omit?.length) {
    const copy = {};

    for (const key in def) {
      if (omit.includes(key)) {
        continue;
      }

      copy[key] = def[key];
    }
  }

  return def;
};
