import $karman from "./karman/index.js";
import { send, set } from "./dom/index.js";
import { defineAPI, defineIntersectionRules, defineUnionRules, getType } from "../../dist/karman.js";
import product from "./karman/schema/product.js";

const request1 = async () => {
  try {
    const [resPromise] = $karman.schemaTest3({ id, title });
    const res = await resPromise;
    console.log();
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

$karman.schemaTest3({ id, products });
$karman.schemaTest2({ title, image });
$karman.schemaTest({ title, image });
$karman.arrPayloadDefTest({ id, title, image });

const api = defineAPI({
  url: "https://fakestore.com/products/:id",
  validation: true,
  headers: {
    "Content-Type": "application/json",
  },
  payloadDef: {
    /** identifier of a product */
    id: {
      rules: ["int", { min: 1 }],
      type: 1,
    },
  },
});
