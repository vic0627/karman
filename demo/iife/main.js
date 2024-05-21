import fakeStore from "./fake-store/index.js";
import { app, send, set } from "./dom/index.js";
import { defineAPI, defineIntersectionRules, defineUnionRules, getType } from "../../dist/karman.js";
import limitAndSortSchema from "./fake-store/schema/limit-and-sort-schema.js";
import productInfoSchema from "./fake-store/schema/product-info-schema.js";
import { fromEvent, map, mergeMap } from "rxjs";

const getProducts = defineAPI({
  url: "https://fakestoreapi.com/products",
  payloadDef: limitAndSortSchema
    .mutate()
    .setPosition("query")
    .setDefault("limit", () => 10)
    .setOptional().def,
  rx: true,
  validation: true,
  dto: getType([productInfoSchema.def]),
});

const subscription = getProducts({ sort: "desc" })
  .pipe(
    mergeMap((arr) => arr.data),
    map((value) => {
      const img = document.createElement("img");
      img.style.width = "20px";
      img.setAttribute("src", value.image);
      return img;
    }),
  )
  .subscribe((img) => app.appendChild(img));

// send.addEventListener("click", () => {
// });

set.addEventListener("click", () => {
  subscription.unsubscribe();
});
