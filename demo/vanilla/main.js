import rootKarman from "./root-karman";

const btn = document.getElementById("btn");

const request = async () => {
  try {
    const [resPromise] = rootKarman.fakeStore.product.getAll();

    console.log(await resPromise);
  } catch (error) {
    console.error(error);
  }
};

btn.addEventListener("click", () => {
  request();
});
