import $karman from "./karman/index.js";
import { send, set } from "./dom/index.js";

const request1 = async () => {
  try {
    const [resPromise] = $karman.schemaTest({
      id: 3,
      title: "hello",
      category: "electronics",
    });

    console.log(await resPromise);
  } catch (error) {
    console.error(error);
  }
};
const request2 = async () => {
  try {
    const [resPromise] = $karman.schemaTest2({
      title: "hello",
      category: "electronics",
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
  if (delegate === request1) delegate = request2;
  else delegate = request1;
});
