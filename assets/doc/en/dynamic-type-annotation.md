# Dynamic Type Annotation

> [!TIP]
> It is recommended to have prior knowledge of [JSDoc](https://jsdoc.app/) and [TypeScript](https://www.typescriptlang.org/) before reading this chapter.

Another powerful feature provided by Karman is the ability to dynamically map configurations of defineKarman and defineAPI to Karman nodes in real-time through TypeScript generic parameters and IDE's [LSP](https://microsoft.github.io/language-server-protocol/) integration. This includes final APIs, subpaths, as well as inputs and outputs of final APIs.

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

As mentioned in the [Parameter Definition](./final-api.md) section, the `payload` of the final API is mainly defined through the `payloadDef` property of `defineAPI` and mapped to the `payload` of the final API. However, the properties of `payloadDef` are objects, and in most cases, the mapped payload may not comply with the defined rules.

However, due to inherent limitations in language mechanisms, it's not feasible to directly convert parameter rules into corresponding types displayed in hover tooltips. Therefore, Karman uses JSDoc in conjunction with the `@type` tag to forcefully annotate the types of parameters, allowing the final API to display the correct required types for the `payload` property in hover tooltips, rather than a complete parameter definition object.

> [!NOTE]
> Using the `@type` tag to force type annotations is to obtain more complete parameter hint messages when calling final APIs and does not affect the operation of Karman itself.

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
         * @type {number | void}
         */
        limit: {
          position: "query",
          rules: "int",
        },
        /**
         * Sorting strategy
         * @type {"asc" | "desc" | void}
         */
        sort: {
          position: "query",
          rules: "string",
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

In the example above, because both parameters are optional properties, it's necessary to represent them as optional during mapping. However, in TypeScript's type mapping, it's not possible to perform overly complex operations to conditionally make properties optional (`{ [x: string]?: any; }`) or required. Therefore, another approach is needed to indicate that a parameter is optional.

`undefined` is a subtype of all types. Therefore, annotations like `@type {string | number | undefined}` will be simplified to `string | number` in the final type display, thus losing the meaning of indicating that the parameter is optional. Meanwhile, `void` is originally used to describe the absence of a return value in functions and is not a subtype of other types. In this context, it can be used to represent optional parameters.

## DTO of Output/Response

Output needs to be configured through the `dto` property in `defineAPI()`. `dto` does not affect program execution; it only affects the type of the final API's return result. Therefore, it can be assigned any value. There are many ways to configure `dto`, but to save memory space, it is recommended to use type files and JSDoc.

> [!WARNING]
> There are many factors that can affect the return type, including `dto`, `onSuccess`, `onError`, etc. Therefore, the compiler may encounter type discrepancies due to environmental or contextual factors during parsing.

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
