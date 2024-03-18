import rootKarman from "./root-karman";

const request = async () => {
  try {
    const [resPromise] = rootKarman.fakeStore.stringTest({
      param01: "l",
      param02: 2,
    });

    console.log(await resPromise);
  } catch (error) {
    console.error(error);
  }
};

request();
