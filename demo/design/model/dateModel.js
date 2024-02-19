const query = true;

const dateModel = {
  startdate: {
    query,
    rules: ["string"],
  },
  enddate: {
    query,
    rules: ["string"],
  },
};

export default dateModel;
