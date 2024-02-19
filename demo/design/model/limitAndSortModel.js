const limitAndSortDef = {
  limit: {
    query: true,
    rules: ["number", "min=0"],
  },
  sort: {
    query: true,
    rules: [
      "string",
      (value) => {
        if (!["desc", "asc"].includes(value)) {
          throw new Error("parameter 'sort' should be 'asc' or 'desc'");
        }
      },
    ],
  },
};

export default limitAndSortDef;
