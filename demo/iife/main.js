import fakeStore from "./fake-store/index.js";
import { send, set } from "./dom/index.js";
import { defineAPI, defineIntersectionRules, defineUnionRules, getType } from "../../dist/karman.js";
import limitAndSortSchema from "./fake-store/schema/limit-and-sort-schema.js";
import { fromEvent } from "rxjs";

const getProducts = defineAPI({
  url: "https://fakestoreapi.com/products",
  payloadDef: limitAndSortSchema
    .mutate()
    .setPosition("query")
    .setDefault("limit", () => 10)
    .setOptional().def,
  rx: true,
  validation: true,
});

let subscription;

fromEvent(send, "click").subscribe(() => {
  subscription = getProducts({ sort: "desc" }).subscribe((value) => console.log(value));
});

fromEvent(set, "click").subscribe(() => {
  subscription?.unsubscribe();
});

// send.addEventListener("click", () => {
//   subscription = getProducts({ sort: "desc" }).subscribe((value) => console.log(value));
// });
// set.addEventListener("click", () => {
//   subscription.unsubscribe();
// });
