import fakeStore from "./src/fake-store";
import { isValidationError } from "@vic0627/karman";

const n = document.getElementById("number");
const t = document.getElementById("text");
const btnSend = document.getElementById("btn-send");
const btnAbort = document.getElementById("btn-abort");

let abortfn = () => {};

const request = async () => {
  try {
    const limit = +n.value;
    const sort = t.value;
    const payload = {};
    if (limit) payload.limit = limit;
    if (sort) payload.sort = sort;

    const [resPromise, abort] = fakeStore.product.getAll(payload, {
      onSuccess(res) {
        return null;
      },
      // cache: true,
      requestStrategy: "xhr"
    });
    abortfn = abort;
    const res = await resPromise;
    console.log(res);
  } catch (error) {
    console.error(error);
    if (isValidationError(error)) alert(error.message);
  }
};

btnSend.addEventListener("click", () => {
  request();
});
btnAbort.addEventListener("click", () => {
  abortfn("abort here~");
});

