import $karman from "./karman/index.js";
import { send, set } from "./dom/index.js";
import { defineAPI, defineIntersectionRules, defineUnionRules } from "../../dist/karman.js";

const request1 = async () => {
  try {
    const [resPromise] = $karman.product.getAll();

    console.log(await resPromise);
  } catch (error) {
    console.error(error);
  }
};
const request2 = async () => {
  try {
    const [resPromise] = $karman.schemaTest2({
      price: 2134,
      category: "electronics",
    });

    console.log(await resPromise);
  } catch (error) {
    console.error(error);
  }
};
const products = Array.from({ length: 100 }, (_, i) => {
  const p = {
    title: "hello",
    category: "men's clothing",
    price: 34,
    description: "hello",
    image: new File([], "sth"),
  };

  if (i === parseInt(Math.random() * 100)) p.image = "wtf";

  return p;
});
const request3 = async () => {
  try {
    const [resPromise] = $karman.schemaTest3({
      products,
    });

    console.log(await resPromise);
  } catch (error) {
    console.error(error);
  }
};

let delegate = request1;

send.addEventListener("click", () => {
  delegate();
});

set.addEventListener("click", () => {
  // if (delegate === request1) delegate = request2;
  // else delegate = request1;
});
