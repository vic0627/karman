import fakeStore from "./fake-store";

const request = async () => {
  try {
    const [resPromise] = fakeStore.cart.getAll(
      {
        sort,
        limit,
        startdate,
        enddate,
      },
      {
        onSuccess(res) {
          return res.data;
        },
      },
    );

    const res = await resPromise;
  } catch (error) {
    console.error(error);
  }
};
    