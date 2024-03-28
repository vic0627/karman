import fakeStore from "src/fake-store";

const btnSend = document.getElementById("btn-send");
const btnAbort = document.getElementById("btn-abort");

let abortfn = () => void 0;

const request = async () => {
  try {
    const [resPromise, abort] = fakeStore.product.getAll(
      { limit: 5, sort: "asc" },
      {
        onSuccess(res) {
          return res.data;
        },
        // cache: true,
        requestStrategy: "xhr"
      },
    );
    abortfn = abort;
    const res = await resPromise;
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

btnSend.addEventListener("click", () => {
  request();
});
btnAbort.addEventListener("click", () => {
  abortfn("abort here~");
});
