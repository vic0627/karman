# 動態型別註解

> [!TIP]
> 建議閱讀此章節前請先瞭解 [JSDoc](https://jsdoc.app/) 與 [TypeScript](https://www.typescriptlang.org/)。

Karman 提供的另一種額外的強大功能，就是透過 TypeScript 泛型參數與 IDE 的 [LSP](https://microsoft.github.io/language-server-protocol/) 搭配，使 `defineKarman` 與 `defineAPI` 的配置能夠即時映射至 karman node 上，包括 FinalAPI 、子路徑、與 FinalAPI 的輸入與輸出。

- [動態型別註解](#動態型別註解)
  - [JSDoc](#jsdoc)
      - [輸入（Payload）的資料傳輸物件](#輸入payload的資料傳輸物件)
      - [輸出（Response）的資料傳輸物件](#輸出response的資料傳輸物件)


## JSDoc

JSDoc 是一種註解方式的標準化規範，在支援自動解析 JSDoc 的 IDE 上（如 Visual Studio Code），能夠使被註解的變數、屬性、或方法等提供相應的註解訊息。

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

/**
 * # API 管理中心
 */
const rootKarman = defineKarman({
  // ...
  api: {
    /**
     * ## 連線測試
     */
    connect: defineAPI(),
  },
  route: {
    /**
     * ## 用戶管理
     */
    user: defineKarman({
      // ...
      api: {
        /**
         * ### 取得所有用戶
         */
        getAll: defineAPI({
          // ...
        }),
        /**
         * ### 創建新用戶
         */
        create: defineAPI({
          // ...
        }),
      },
    }),
  },
});

// 於 js 中嘗試 hover 以下變數、屬性、或方法會於懸停提示顯示右邊的註解內容
rootKarman; // API 管理中心
rootKarman.connect(); // 連線測試
rootKarman.user; // 用戶管理
rootKarman.user.getAll(); // 取得所有用戶
rootKarman.user.create(); // 創建新用戶
```

#### 輸入（Payload）的資料傳輸物件

根據[參數定義](./final-api.md)章節，可以知道 FinalAPI 的 `payload` 主要是透過 `defineAPI` 的 `payloadDef` 屬性去定義，並映射到 FinalAPI 的 `payload` 上，而 `payloadDef` 的屬性值為物件，通常情況下，映射出來的 `payload` 不會符合定義的規則。

然而語言機制上的先天限制，要使參數的規則能夠直接轉換為對應型別顯示到懸停提示中顯然不太可能，因此 karman 選用了與 JSDoc 搭配，利用 `@type` 標籤強制註解參數的型別，讓 FinalAPI 能夠在懸停提示顯示 `payload` 屬性正確的所需型別，而不是一個完整的參數定義物件。

> [!NOTE]
> 透過 `@type` 標籤強制註記型別，是為了調用 FinalAPI 時能夠獲得更完整的參數提示訊息，並不會影響到 karman 本身運行。

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

const rootKarman = defineKarman({
  // ...
  api: {
    /**
     * ### 取得所有結果
     */
    getAll: defineAPI({
      // ...
      payloadDef: {
        /**
         * 回傳筆數限制
         * @type {number | undefined}
         */
        limit: {
          position: "query",
          rules: "int",
        },
        /**
         * 排序策略
         * @type {"asc" | "desc" | undefined}
         */
        sort: {
          position: "query",
          rules: "string",
        },
      },
    }),
  },
});

// hover 在 limit 與 sort 上會顯示對應型別與註解
rootKarman.getAll({
  limit: 10,
  sort: "asc",
});
```

在上面的例子當中，因為兩個參數都不是必要屬性，所以需要在映射時能夠表示該參數為可選屬性，但在 TypeScript 的型別映射中，無法做到過於複雜的操作，讓屬性有條件地可選（`{ [x: string]?: any; }`）或不可選，因此要以其他方式表示該參數是可選屬性。

#### 輸出（Response）的資料傳輸物件

輸出需要透過 `defineAPI()` 中的 `dto` 屬性來配置，`dto` 不會影響程式運行，只會影響 FinalAPI 回傳結果的型別，因此可以給予任何值，而 `dto` 的配置方式有很多種，但為了節省記憶體空間，推薦使用型別文件及 JSDoc。

> [!WARNING]
> 會影響回傳結果型別的因素非常多，包括 `dto`、`onSuccess`、`onError` 等，因此編譯器在解析時，可能會因環境或上下文而導致回傳結果的型別有誤差。

- **直接賦值**

  ```js
  // ...
  export default defineKarman({
    // ...
    api: {
      getProducts: defineAPI({
        dto: [
          {
            /** 編號 */
            id: 0,
            /** 名稱 */
            title: "",
            /** 價格 */
            price: 0,
            /** 說明 */
            description: "",
          },
        ],
      }),
    },
  });
  ```

- **JSDoc**

  ```js
  /**
   * @typedef {object} Product
   * @prop {number} Product.id - 編號
   * @prop {string} Product.title - 名稱
   * @prop {number} Product.price - 價格
   * @prop {string} Product.description - 說明
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

- **TypeScript + JSDoc**

  ```ts
  // /product.type.ts
  export interface Product {
    /** 編號 */
    id: number;
    /** 名稱 */
    title: string;
    /** 價格 */
    price: number;
    /** 說明 */
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
