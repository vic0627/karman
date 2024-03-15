import fakeStore from "./src/fake-store/index.js";

const request = async () => {
  try {
    const [resPromise] = fakeStore.product.getAll(
      null,
      {
        onSuccess(res) {
          console.log("interceptor =>", res);
          const _res = res.data.map((product) => product.title)
          return _res;
        },
      },
    );

    const res = await resPromise;

    console.log("after pre-processing =>", res);
  } catch (error) {
    console.error(error);
  }
};

request();
