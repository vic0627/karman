# Schema API

The Schema API allows you to use the entire [`payloadDef`](./final-api.md) as a versatile, flexible, and reusable `SchemaType`. Besides serving as a `payloadDef`, a `SchemaType` can also be registered on the Karman Tree. Once registered, all `payloadDef[param].rules` under the Karman Tree can be used as a [String Rule](./validation-engine.md) with the name of the `SchemaType`. Even better, when using a `SchemaType` as a String Rule, it supports [array syntax](./validation-engine.md), allowing you to perform complex validation with minimal code.

To use it, you need to define a schema using `defineSchemaType`. This method takes two parameters: the name of the schema and an object similar to the object type of `payloadDef`. This object can define parameters as required or optional (`required`), validation rules (`rules`), usage position (`position`), and default values (`defaultValue`). These parameter-related messages serve as the initial state of the schema. Except for `rules`, all attributes can be changed using `SchemaType.mutate()`.

Below is an example of defining a simple schema for product categories. This schema includes only one parameter, `category`, and its validation rules:

```js
// schema/category.js
import { defineSchemaType, defineCustomValidator, ValidationError } from "@vic0627/karman"

export default defineSchemaType("Category", {
  /**
   * category of products
   * @type {"electronics" | "jewelery" | "men's clothing" | "women's clothing"}
   */
  category: {
    rules: [
      "string",
      defineCustomValidator((_, value) => {
        if (!["electronics", "jewelery", "men's clothing", "women's clothing"].includes(value))
          throw new ValidationError("invalid category");
      }),
    ],
  },
});
```

> [!NOTE]
> In a schema, you can still use JSDoc's `@type` tag to enforce type annotations or provide additional parameter descriptions. This will be beneficial for later type inference of the `payload` object when calling FinalAPI.

Next, you can use this schema in `payloadDef`, but you need to access the objects that `payloadDef` can use through the `def` property. Additionally, in this context, `category` will be used as a path parameter and must be a required parameter. Therefore, you can initialize additional information of the schema using `.mutate()` method, and then change the detailed definition inside the schema using `.setPosition()` and `.setRequired()` methods. Finally, obtain the edited schema through the `def` property:

```js
// ...
import category from "./schema/category.js";

const getProductsByCategory = defineAPI({
  url: "https://karman.com/products/:category",
  payloadDef: category.mutate().setPosition("path").setRequired().def,
  validation: true,
  // ...
});

const [resPromise] = getProductsByCategory({ category: "electronics" });
resPromise.then((res) => console.log(res));
```

Next, let's try defining a product information schema and include `category` as part of the product information schema. Here, we use the initial value of the `category` schema, so there is no need to call `.mutate()`. Simply use the spread operator `...` to spread `category.def`:

```js
// schema/product.js
// ...
import category from "./category.js"

export default defineSchemaType("Product", {
  ...category.def,
  /**
   * name of the product
   * @min 1
   * @max 20
   * @type {string}
   */
  title: {
    rules: ["string", { min: 1, max: 20, measurement: "length" }],
  },
  /**
   * price
   * @min 1
   * @type {number}
   */
  price: {
    rules: ["number", { min: 1 }],
  },
  /**
   * description
   * @min 1
   * @max 100
   * @type {string}
   */
  description: {
    rules: ["string", { min: 1, max: 100, measurement: "length" }],
  },
  /**
   * image
   * @max 5MiB
   * @type {File}
   */
  image: {
    rules: [File, { measurement: "size", max: 1024 * 1024 * 5 }],
  },
})
```

## Using Schema as String Rule

To use a schema as a string rule, it must be registered in the `schema` property of the Karman tree. It is not necessary to register it on the root node, but eventually, the registered schema will be temporarily stored in the root node. Furthermore, it designates the Karman tree as the scope for this schema's string rule type. Within this scope, the schema name can be used as a validation rule. However, it's important to note that when a schema is used as a string rule, only the original definition of the schema is used as the validation rule, and the `defaultValue` attribute is not applicable.

Suppose we register the above schema `product` on a Karman tree. In that case, it can be used as the "type" of a parameter and serve as a validation rule. Additionally, this type can be added to array syntax to perform deep traversal and validation of arrays:

```js
// /product-management.js
// ...
import product from "./schema/product.js";

export default defineKarman({
  // root: true, // Assume this node is not the root node
  url: "products",
  schema: [product],
  api: {
    addProducts: defineAPI({
      method: "POST",
      payloadDef: {
        /** @type {typeof product.def[]} */
        data: {
          rules: "Product[]",
          required: true,
        },
      },
    }),
  },
});

// /index.js
// ...
import karman from "./karman.js";

const [resPromise] = karman.productManagement.addProducts({
  data: [
    {
      title: "blue shirt",
      price: 100,
      // ...
    },
    {
      title: "red skirt",
      price: 99.99,
      // ...
    },
  ],
});
```

In fact, we can also use the string rule type of a schema within an attribute of another schema, as long as the schemas referencing each other are registered on the same Karman tree. However, it's essential to note whether there are any occurrences of circular references between schemas (including self-reference or closed cycles). Since the Schema API does not support this type of reference pattern, it checks the reference status of each schema within the same scope during registration. When a circular reference occurs, Karman immediately throws an error and notifies about the schemas involved in the circular reference:

```js
// ...

const schemaA = defineSchemaType("SchemaA", {
  param01: {
    // ...
  },
  param02: {
    rules: "SchemaB", // Referencing another schema
  },
});
const schemaB = defineSchemaType("SchemaB", {
  param01: {
    // ...
  },
  param02: {
    rules: "SchemaA", // Referencing the previous schema, creating a closed cycle
  },
});

const routeA = defineKarman({
  // ...
  schema: [schemaB], // Schemas don't have to be registered on the root node, just ensure that two schemas with referencing relationships belong to the same root node
});

export default defineKarman({
  // ...
  root: true,
  schema: [schemaA], // Reference Error: schemaA and schemaB form a closed cycle, error is thrown during initialization
  route: {
    routeA,
  },
});
```