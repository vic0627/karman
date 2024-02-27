const { defineKarman } = require("./karman/karman.js");
const product = require("./routes/product");

const karman = defineKarman({
  url: "https://fakestoreapi.com/",
  routes: {
    product,
  },
});
