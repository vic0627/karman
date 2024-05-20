# Dynamic Type Annotation

> [!TIP]
> It is recommended to have prior knowledge of [JSDoc](https://jsdoc.app/) and [TypeScript](https://www.typescriptlang.org/) before reading this chapter.

Another powerful feature provided by Karman is the ability to dynamically map configurations of `defineKarman` and `defineAPI` to Karman nodes in real-time through TypeScript generic parameters and IDE's [LSP](https://microsoft.github.io/language-server-protocol/) integration. This includes finalAPIs, subpaths, as well as inputs and outputs of finalAPIs.

- [Dynamic Type Annotation](#dynamic-type-annotation)
  - [JSDoc](#jsdoc)
  - [DTO of Input/Payload](#dto-of-inputpayload)
  - [DTO of Output/Response](#dto-of-outputresponse)

## JSDoc

JSDoc is a standardized specification for annotating code. When used in IDEs that support automatic parsing of JSDoc (such as Visual Studio Code), it provides corresponding annotation messages for annotated variables, properties, or methods.

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

/**
 * # API Management Center
 */
const rootKarman = defineKarman({
  // ...
  api: {
    /**
     * ## Connection Test
     */
    connect: defineAPI(),
  },
  route: {
    /**
     * ## User Management
     */
    user: defineKarman({
      // ...
      api: {
        /**
         * ### Get All Users
         */
        getAll: defineAPI({
          // ...
        }),
        /**
         * ### Create New User
         */
        create: defineAPI({
          // ...
        }),
      },
    }),
  },
});

// Hovering over the following variables, properties, or methods in JavaScript will display the annotation content on the right in the tooltip
rootKarman; // API Management Center
rootKarman.connect(); // Connection Test
rootKarman.user; // User Management
rootKarman.user.getAll(); // Get All Users
rootKarman.user.create(); // Create New User
```

## DTO of Input/Payload

As mentioned in the [Parameter Definition](./final-api.md) section, the `payload` of the FinalAPI is mainly defined through the `payloadDef` property of `defineAPI` and mapped to the `payload` of the FinalAPI. However, the properties of `payloadDef` are objects, and in most cases, the mapped payload may not comply with the defined rules.

Therefore, you can change the type of attributes displayed in the `payload` by setting the `type` property. The `type` itself is an optional parameter. If you need to call the FinalAPI and want the `payload` object to show the correct type hints for each attribute, you must set this parameter. Additionally, if the attribute is a composite type, you can use the `getType` API. `getType` will convert all passed parameters into a Union Type. `getType` also supports converting `SchemaType.def`, so you can use `getType` to obtain the correct type of a Schema.

> [!WARNING]
> Type annotation on the keys of `PayloadDef` with JSDoc tag `@type` has been deprecated. Considering annotate types via `ParamDef.type` and `getType` which were introduced in Karman v1.3.0.

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

const rootKarman = defineKarman({
  // ...
  api: {
    /**
     * ### Get All Results
     */
    getAll: defineAPI({
      // ...
      payloadDef: {
        /**
         * Limit of returned records
         */
        limit: {
          position: "query",
          rules: "int",
          type: getType(1, undefined), // output => number | undefined
        },
        /**
         * Sorting strategy
         */
        sort: {
          position: "query",
          rules: "string",
          type: getType("asc", "desc", undefined), // output => "asc" | "desc" | undefined
        },
      },
    }),
  },
});

// Hovering over limit and sort will display the corresponding types and annotations
rootKarman.getAll({
  limit: 10,
  sort: "asc",
});
```

## DTO of Output/Response

Output needs to be configured through the `dto` property in `defineAPI()`. `dto` does not affect program execution; it only affects the type of the FinalAPI's return result. Therefore, it can be assigned any value. There are many ways to configure `dto`, but to save memory space, it is recommended to use type files and JSDoc.

> [!WARNING]
> There are many factors that can affect the return type, including `dto`, `onSuccess`, `onError`, etc. Therefore, the compiler may encounter type discrepancies due to environmental or contextual factors during parsing.

- Schema + getType

  ```js
  import { defineKarman, defineAPi, getType } from "@vic0627/karman";
  import productSchema from "./schema/product-schema.js";

  export default defineKarman({
    // ...
    api: {
      getProducts: defineAPI({
        dto: getType([productSchema.def]),
      }),
    },
  });
  ```

- Direct Assignment

  ```js
  // ...
  export default defineKarman({
    // ...
    api: {
      getProducts: defineAPI({
        dto: [
          {
            /** ID */
            id: 0,
            /** Title */
            title: "",
            /** Price */
            price: 0,
            /** Description */
            description: "",
          },
        ],
      }),
    },
  });
  ```

- JSDoc

  ```js
  /**
   * @typedef {object} Product
   * @prop {number} Product.id - ID
   * @prop {string} Product.title - Title
   * @prop {number} Product.price - Price
   * @prop {string} Product.description - Description
   */
  // ...
  export default defineKarman({
    // ...
    api: {
      getProducts: defineAPI({
        /**
         * @type {Product[]}
         */
        dto: null,
      }),
    },
  });
  ```

- TypeScript + JSDoc

  ```ts
  // /product.type.ts
  export interface Product {
    /** ID */
    id: number;
    /** Title */
    title: string;
    /** Price */
    price: number;
    /** Description */
    description: string;
  }
  ```

  ```js
  // ...
  export default defineKarman({
    // ...
    api: {
      getProducts: defineAPI({
        /**
         * @type {import("product.type").Product[]}
         */
        dto: null,
      }),
    },
  });
  ```
