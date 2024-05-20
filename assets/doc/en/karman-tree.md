# Karman Tree

As mentioned in the [Simple Demonstration](../../../README.md), you can use `defineKarman` to create an abstraction layer node, a Karman instance, or what we call a "karman node". In fact, you can organize even more complex "karman trees" in a nested manner. This allows us to manage different levels of abstraction based on API paths and different configuration requirements.

- [Karman Tree](#karman-tree)
  - [URL Management](#url-management)
  - [Inheritance](#inheritance)
  - [Dependency](#dependency)

## URL Management

Within each `defineKarman` configuration, you can specify the URL path for that layer. The path can be either configured or left empty, and it can be a complete URL or just a fragment. However, it's important to note that the URL configured for a karman node will be combined with the URL of its parent node to form the base URL for that node.

```js
import { defineKarman } from "@vic0627/karman";

const rootKarman = defineKarman({
  root: true,
  // The base URL for this node is "https://karman.com"
  url: "https://karman.com",
  route: {
    product: defineKarman({
      // The base URL for this node is "https://karman.com/products"
      url: "products",
    }),
    user: defineKarman({
      // The base URL for this node is "https://karman.com/users"
      url: "users",
    }),
  },
});
```

To configure child nodes, you can use the `route` property. The `route` property is an object where the keys represent the names of the nodes and the values represent karman nodes. These karman nodes are mounted on the parent node after initialization, and you can access the final API or grandchild nodes by the path name you configured for the child node.

```js
rootKarman.product.someAPI();
rootKarman.user.someNode.someAPI();
```

In rare cases, frontend applications may need to communicate with APIs hosted on different domains. In such cases, you can integrate them using `defineKarman`, allowing the entire project to communicate with different servers through a single interface.

```js
import { defineKarman } from "@vic0627/karman";

export default defineKarman({
  // The URL is empty at this level
  root: true,
  route: {
    source01: defineKarman({
      // This node manages all APIs under source01
      url: "https://source01.com",
    }),
    source02: defineKarman({
      // This node manages all APIs under source02
      url: "https://source02.com",
    }),
  },
});
```

## Inheritance

"Inheritance event" occurs when the `root` property of a karman node is set to true. When this event is triggered, the configuration of the root node is inherited by its child and even grandchild nodes, until the configuration is overridden by a child or grandchild node. The overridden configuration will also exhibit the same inheritance behavior.

```js
import { defineKarman } from "@vic0627/karman";

export default defineKarman({
  // ...
  root: true,
  // Configure headers for inheritance
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  route: {
    route01: defineKarman({
      // This node inherits the headers configuration from the parent node
    }),
    route02: defineKarman({
      // This node overrides the headers
      headers: {
        // ...
      },
    }),
  },
});
```

> [!WARNING]
> Configure static properties for headers. If you need to include dynamic information in headers, use [interceptors](./middleware.md).

If a karman tree is not configured with a root node, the following considerations apply:

- Although APIs can still be sent, the configuration obtained for that API will only reference the karman node at that layer. If the url of the node and the url configured for the API cannot form a valid URL, it may result in errors when sending requests.
- Exclusive features of the root node cannot be used, such as setting scheduling task execution intervals for the karman tree.

> [!NOTE]
> The scheduler manager's main task is to respond to data cache checks and clearances. The task execution interval can be set using the `scheduleInterval` property and can only be configured through the root node.

The inheritance event for each karman node is triggered only once. This means that if a descendant node is set as a root node, the karman node will generate a one-time inheritance event. When this karman node subsequently receives inheritance signals passed down from its ancestor node, it will interrupt inheritance for all nodes below (including) that node because the event has already occurred for that node.

## Dependency

In [Middleware](./middleware.md), Interceptors and Hooks configurations will be introduced. These types of configurations can access the properties or methods on the karman node through this inside functions. If there are constants or methods commonly used in Middleware, consider installing them on the karman node.

Dependency installation needs to be executed through the karman node using the `Karman.$use()` method. After installation, a similar inheritance event will be triggered again, making the entire karman tree reference the dependency. The dependency itself must be an object and must have an `install()` method.

> [!WARNING]
> Restriction of installing dependencies via root karman node has been removed in Karman v1.3.0, and the implementation of `install` method has changed either.

In addition, Karman itself also provides built-in dependencies:

- `Karman._typeCheck`: Type validator used by the [Validation Engine](./validation-engine.md).
- `Karman._pathResolver`: Module used by karman to compose URLs, similar to the `path` module in node.js.

```js
import { defineKarman } from "@vic0627/karman";

// Common method in hooks
const add = (a, b) => a + b;
// Define the `install()` method for `add()` first
Object.defineProperty(add, "install", {
  value: (Karman) => {
    // Define the implementation of the `install()` method
    Karman.prototype._add = add;
  },
});

const karman = defineKarman({
  root: true,
  onRequest() {
    const isString = this._typeCheck.isString(""); // Built-in dependency
    const paths = this._pathResolver.trim("//foo/bar///"); // Built-in dependency
    const sum = this._add(2, 3); // Manually installed dependency
    console.log(isString, paths, sum);
  },
  // ...
});

karman.$use(_add); // Install dependencies using the root karman node

karman.someAPI(); // console output: true "foo/bar" 5
```

**Supplement: Making Dependencies Support Syntax Prompting**

If you want the installed dependencies to support syntax prompting, you can use a `.d.ts` declaration file. First, write the dependency in another `.js` file:

```js
// /src/karman/constant.js
const _constant = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  install(Karman) {
    Karman.prototype._constant = this;
  },
};
export default _constant;
```

In the same directory, add a .d.ts declaration file with the same name:

```ts
// /src/karman/constant.d.ts
interface Constant {
  second: number;
  minute: number;
  hour: number;
}
declare const _constant: Constant;
export default _constant;

// ⚠️ Remember to write module extension declarations and declare dependencies in KarmanDependencies
declare module "@vic0627/karman" {
  interface KarmanDependencies {
    /**
     * You can also write comments for dependencies using block comments
     */
    _constant: Constant;
  }
}
```

Finally, import the dependency in the root karman file, and later use the dependency in Middleware to support complete syntax prompting:

```js
// /src/karman/index.js
import { defineKarman } from "@vic0627/karman";
import constant from "./constant";

const rootKarman = defineKarman({
  // ...
  onRequest() {
    this._constant; // <= Hover displays type and comment
  },
});

rootKarman.$use(constant);
```
