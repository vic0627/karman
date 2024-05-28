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

let subscription;

const [res] = fakeStore.user.add({
  email: "karman@yahoo.com",
  username: "karman",
  password: "adsfouaihg",
  name: {
    firstname: "whtasdf",
    lastname: "123",
  },
  address: {
    city: "hello",
    street: "jello",
    number: 12345,
    zipcode: "wow",
    geolocation: {
      lat: "123",
      long: "321",
    },
  },
  phone: "asdf",
});

res.then((data) => console.log(data));

send.addEventListener("click", async () => {
  // subscription = getProducts({ sort: "desc" })
  //   .pipe(
  //     mergeMap((arr) => arr.data),
  //     map((value) => {
  //       const img = document.createElement("img");
  //       img.style.width = "20px";
  //       img.setAttribute("src", value.image);
  //       return img;
  //     }),
  //   )
  //   .subscribe((img) => app.appendChild(img));
});

set.addEventListener("click", () => {
  // subscription.unsubscribe();
});
