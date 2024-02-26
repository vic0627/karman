import { defineKarman } from "karman";
import product from "./routes/product";

const karman = defineKarman({
  baseURL: "https://fakestoreapi.com/",
  routes: {
    product,
  },
});
