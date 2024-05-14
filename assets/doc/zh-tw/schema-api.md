# Schema API

Schema API 允許你以整個 [`payloadDef`](#parameter-definition) 作為一個多功能、高彈性、高復用性的 `SchemaType`，`SchemaType` 除了能夠作為 `payloadDef` 來使用之外，還能將其註冊在 Karman Tree 上，當 `SchemaType` 註冊後，Karman Tree 下的所有 `payloadDef[param].rules` 都能以 `SchemaType` 的名子做為[字串規則](./validation-engine.md)使用，更棒的是，以字串規則使用的 `SchemaType` 允許支援[陣列語法](./validation-engine.md)，能夠讓你以最少的程式碼進行最複雜的驗證功能。

在使用上，需要以 `defineSchemaType` 來定義一個 schema，該方法將接收兩個參數，第一個參數是這 schema 的名字，後續若要以這 schema 作為字串規則使用，必須使用這個名字，而第二個參數則與物件型態的 `payloadDef` 相同，可以定義參數的必填非必填（`required`）、驗證規則（`rules`）、使用位置（`position`）與預設值（`defaultValue`），這些參數相關的訊息將作為此 schema 的初使狀態，並且除了 `rules` 以外的屬性，後序都能使用 `SchemaType.mutate()` 來改變狀態。

下面會先以商品種類的參數定義一個簡單的 schema，這個 schema 僅會包含一個參數 `category` 與其驗證規則：

```js
// schema/category.js
import { defineSchemaType, defineCustomValidator, ValidationError } from "@vic0627/karman";

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
> 在 schema 中，仍然可以透過 JSDoc `@type` 標籤強制註記型別或加上其他參數說明，這會有利於後續調用 FinalAPI 時對於 `payload` 物件的型別判斷。

接著，你可以在 `payloadDef` 中使用這個 schema，但需要以 `def` 屬性來存取 `payloadDef` 可使用的物件。另外，在這情境中，`category` 將作為路徑參數使用，且須為必要參數，因此可以用 `.mutate()` 先初始化 schema 的附加資訊，再用 `.setPosition()` 與 `.setRequired()` 方法來改變 schema 內的細部定義，最後透過 `def` 屬性來取得編輯過的 schema：

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

再來，我們可以嚐試定義一個商品資訊的 schema，並且將 `category` 引入作為商品資訊 schema 的一部分，在這邊我們使用 `category` schema 的初值，所以不需調用 `.mutate()`，直接使用 `...` 運算子打散 `category.def` 就好：

```js
// schema/product.js
// ...
import category from "./category.js";

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
});
```


## 將 Schema 作為字串規則使用

若要將 schema 作為字串規則使用，必須要將其註冊到 karman tree 上的 `schema` 屬性，這邊不會限定是否一定要在根節點上註冊，但最終註冊的 schema 一定會暫存在根節點中，並且標定該 karman tree 作為此 schema 的字串規則型態的作用域，在此作用域下都可以以 schema 的名字作為驗證規則，但要特別注意，當 schema 作為字串規則使用時，僅會以 schema 最初的定義作為驗證規則，並且不適用 `defaultValue` 屬性。

假設我們將上面的 schema `product` 註冊到一個 karman tree 上，如此一來，將能將這 schema 做為某個參數的「型別」，並以這個 schema 作為驗證規則，除此之外，還能夠將此型別加入陣列語法，讓其對陣列進行深度的遍歷與驗證：

```js
// /product-management.js
// ...
import product from "./schema/product.js"

export default defineKarman({
    // root: true, // 假設此節點不是根節點
    url: "products"
    schema: [product],
    api: {
        addProducts: defineAPI({
            method: "POST",
            payloadDef: {
                /** @type {typeof product.def[]} */
                data: {
                    rules: "Product[]",
                    required: true
                }
            }
        })
    }
})

// /index.js
// ...
import karman from "./karman.js"

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
        }
    ]
})
```

事實上，我們還能將 schema 的字串規則型態用在某個 schema 的屬性之內，只要確保有相互引用的 schema 都有被註冊在同一個 karman tree 上就行，但需要注意的是，schema 之間是否有出現[迴圈引用](https://en.wikipedia.org/wiki/Circular_reference)（包含自我引用或封閉循環）的狀況，由於 Schema API 不支援此類型的引用模式，因此會在註冊當下就會對同一作用域下的各個 schema 的引用狀況進行檢查，當有迴圈引用的情況出現，karman 會立即拋出錯誤並提示出現迴圈引用的 schema：

```js
// ...

const schemaA = defineSchemaType("SchemaA", {
  param01: {
    // ...
  },
  param02: {
    rules: "SchemaB", // 引用另一個 schema
  },
});
const schemaB = defineSchemaType("SchemaB", {
  param01: {
    // ...
  },
  param02: {
    rules: "SchemaA", // 引用上一個 schema，形成封閉循環
  },
});

const routeA = defineKarman({
  // ...
  schema: [schemaB], // schema 不必都註冊在根節點上，只要確保兩個有引用關係的 schema 都同屬一個根節點就好
});

export default defineKarman({
  // ...
  root: true,
  schema: [schemaA], // Reference Error: schemaA 與 schemaB 出現封閉循環，會在初始化階段就拋出錯誤
  route: {
    routeA,
  },
});
```
