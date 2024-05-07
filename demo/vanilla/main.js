import fakeStore from "./src/fake-store";
import { isValidationError } from "@vic0627/karman";

const n = document.getElementById("number");
const t = document.getElementById("text");
const btnSend = document.getElementById("btn-send");
const btnAbort = document.getElementById("btn-abort");

let abortFn = () => {};

const request = async () => {
  try {
    const [resPromise, abort] = fakeStore.product.getAll({
      limit: -1,
    });
    abortFn = abort;
    const res = await resPromise;
    console.log(res.data);
  } catch (error) {
    console.error(error);
    if (isValidationError(error)) alert(error.message);
  }
};

btnSend.addEventListener("click", () => {
  request();
});
btnAbort.addEventListener("click", () => {
  abortFn();
});
