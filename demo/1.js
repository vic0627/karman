const { defineKarman, defineAPI, defineCustomValidator, defineIntersectionRules, defineUnionRules } = karman;

const limitAndSort = {
  limit: { query: true, rules: ["int", { min: 1 }] },
  sort: {
    query: true,
    rules: [
      "string",
      defineCustomValidator((prop, value) => {
        if (!["asc", "desc"].includes(value)) throw new TypeError(`parameter "${prop}" must be "asc" or "desc"`);
      }),
    ],
  },
};

const $k = defineKarman({
  baseURL: "https://fakestoreapi.com",
  requestStrategy: "xhr",
  validation: true,
  onSuccess(res) {
    console.log(res);
  },
  route: {
    product: defineKarman({
      url: "products",
      api: {
        getAllProducts: defineAPI({
          payloadDef: limitAndSort,
        }),
        getSingleProduct: defineAPI({
          payloadDef: {
            id: { path: 0, rules: ["int", { min: 1, required: true }] },
          },
        }),
        getAllCategories: defineAPI({
          endpoint: "categories",
        }),
        getProductsFromCategories: defineAPI({
          endpoint: "category",
          payloadDef: {
            category: {
              path: 0,
              rules: [
                "string",
                defineCustomValidator((_, value) => {
                  if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
                    throw new TypeError("invalid category");
                }),
              ],
            },
          },
        }),
      },
    }),
    cart: defineKarman({
      url: "carts",
      api: {
        getAllCarts: defineAPI({
          payloadDef: limitAndSort,
        }),
      },
    }),
  },
});

$k.product.getAllProducts({ limit: 1 });
$k.product.getSingleProduct({ id: 438 });
$k.cart.getAllCarts({ sort: "desc" });
