const body = true;
const required = "required";

const cartModel = {
  userId: {
    body,
    rules: [required, "number", "min=0"],
  },
  date: {
    body,
    rules: [required, "string"],
  },
  products: {
    body,
    rules: [
      (val) => {
        if (!Array.isArray(val)) {
          throw new TypeError("'products' should be an array");
        }

        val.forEach((prod) => {
          const { productId, quantity } = prod;

          if (productId === undefined || productId === null) {
            throw new Error("property 'productId' is required");
          }

          if (quantity === undefined || quantity === null) {
            throw new Error("property 'quantity' is required");
          }

          if (productId < 0) {
            throw new RangeError("property 'productId' should be greater than or equal to 0");
          }

          if (quantity < 0) {
            throw new RangeError("property 'quantity' should be greater than or equal to 0");
          }
        });
      },
    ],
  },
};

export default cartModel;
