import rootKarman from "./root-karman";

const btnSend = document.getElementById("btn-send");
const btnAbort = document.getElementById("btn-abort");

let abortfn = () => void 0;

const request = async () => {
  try {
    // const [resPromise, abort] = rootKarman.fakeStore.product.getAll({ limit: "hello" });
    // const [resPromise, abort] = rootKarman.fakeStore.product.getById({ id: 1 });
    // const [resPromise, abort] = rootKarman.fakeStore.user.modify({
    //   id: 3,
    //   // email: "foo@gmail.com",
    //   username: "Karman",
    //   password: "f;ldkffs2rt4i",
    //   name: {
    //     firstname: "kar",
    //     lastname: "man",
    //   },
    //   address: {
    //     city: "st",
    //     street: "sdf",
    //     number: 123,
    //     zipcode: "aaa",
    //     geolocation: {
    //       lat: "100",
    //       long: "123",
    //     },
    //   },
    //   phone: "0300",
    // });
    const [resPromise, abort] = rootKarman.fakeStore.ruleSetTest({
      param01: true,
      param02: 1,
    });
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
