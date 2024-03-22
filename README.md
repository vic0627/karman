# karman

HTTP 客戶端 / API 中心化管理 / API 抽象層

## 目錄

- [特色](#特色)
- [開始](#開始)
  - [什麼是 karman？](#什麼是-karman)
  - [簡易示範](#簡易示範)
- [核心]()
  - [Karman Tree](#karman-tree)
  - [Final API](#final-api)
  - [Validation Enigine](#validation-enigine)
  - [Response Caching](#response-caching)
  - [DTO of I/O](#dto-of-io)
- [API 文件](#api-文件)
  - [defineKarman(option)](#definekarmanoption)
  - [Karman](#karman-1)
  - [defineAPI(option)](#defineapioption)
  - [defineCustomValidator(validator)](#definecustomvalidatorvalidator)
  - [defineUnionRules(...rules)](#defineunionrulesrules)
  - [defineIntersectionRules(...rules)](#defineintersectionrulesrules)
  - [ValidationError](#validationerror)
  - [isValidationError(error)](#isvalidationerrorerror)

## 特色

- 彙整瀏覽器 XMLHttpRequest 與 fetch 請求策略
- 樹狀結構路由管理
- 配置的繼承與複寫
- 請求與響應的攔截
- 請求方法的生命週期
- 響應的快取機制
- 取消請求方法
- XMLHttpRequest、fetch 於 I/O 的 JSON 自動轉換
- 統一請求方法的 I/O 介面
- 依值型別實現請求方法的 I/O 介面的 [DTO](https://en.wikipedia.org/wiki/Data_transfer_object)
- 參數驗證引擎

## 開始

### 什麼是 karman？

> karman 取自於地球與外太空的交界處「卡門線 Kármán line」，用來比喻前後端交界處的抽象概念。

karman 是一款用於建構 API [抽象層](https://en.wikipedia.org/wiki/Abstraction_layer)的 JavaScript 套件，以樹狀結構管理 API 的路由、路由上的方法、與配置，並提供封裝後的 API 統一的 I/O 介面，且支援配置 API I/O 介面的 DTO，透過依值型別，封裝後的 API 在被調用時能夠於懸停提示顯示 I/O 介面型別與區域註解，後續透過 karman 調用 API 的開發人員，能夠關注在該 API 所實現的「功能」，而不是建立請求時所需的複雜配置，使抽象層成為「能夠發送請求的 API 文件」。

### 簡易示範

假設某專案有串接的 API 如下：

```txt
GET    https://karman.com/products     # 取得所有商品
POST   https://karman.com/products     # 新增商品
PUT    https://karman.com/products/:id # 更新單一商品
DELETE https://karman.com/products/:id # 刪除單一商品
```

接著使用 karman 來封裝這些 API：

```js
// /karman/index.js
import { defineKarman, defineAPI } from "karman"

export default defineKarman({               // 創建 Karman 實例/節點
    root: true,                             // 指定此層為根節點
    url: "https://karman.com/products",     // 此節點的基本 url
    api: {                                  // 基於上面 url 上的 API
        getAll: defineAPI(),                // 定義取得所有商品的方法
        add: defineAPI({                    // 定義新增商品的方法
            method: "POST"                  // HTTP 方法選用 POST
            payloadDef: {                   // 定義此方法 Input/Payload 介面
                title: {                    // 方法需求參數 title
                    required: true,         // 指定為必要參數
                    body: true              // 指定為請求體參數
                },
                price: {                    // 方法參數需求 price
                    required: true,
                    body: true
                }
            }
        }),
        update: defineAPI({                 // 定義更新商品資訊的方法
            method: "PUT"                   // HTTP 方法選用 PUT
            payloadDef: {
                id: {                       // 方法需求參數 id
                    required: true,
                    path: 0                 // 指定 id 為路徑參數第一位
                },
                title: { body: true },
                price: { body: true }
            }
        })
        delete: defineAPI({                 // 定義刪除商品的方法
            method: "DELETE",               // HTTP 方法選用 DELETE
            payloadDef: {
                id: {
                    required: true,
                    path: 0
                },
            }
        })
    }
})
```

配置完成後，`defineKarman()` 會返回包含 `api` 屬性內所有方法的 `Karman` 實例，可以透過該實例去調用所需方法，而方法本身是同步的，被調用時會初始化請求並返回一個響應 Promise 與一個取消請求的同步方法，建議可以透過[解構賦值](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)的方式將它們取出：

```js
// /path/to/your-file.js
import karman from "@/karman" // 根據專案的 path alias 的設定，路徑可能有所不同

// 取得所有商品
const [productsPromise] = karman.getAll()
// 使用 Promise chaining 取得響應結果
productsPromise.then((res) => {
    console.log(res)
})

// 新增商品
// 從第一個參數傳入 payloadDef 所定義的需求參數
const [newProductPromise] = karman.add({
    title: "foo",
    price: 10,
})
newProductPromise.then((res) => {
    console.log(res)
});

// async/await 二次封裝更新商品方法
const updateProduct = async ({ id, title }) => {
    try {
        const [updatePromise] = karman.update({
            id,
            title,
            // price 並非此方法的必要參數，可傳可不傳
        })
        const res = await updatePromise
        console.log(res)
    } catch (error) {
        console.error(error)
    }
};

// async/await 二次封裝刪除商品方法
const deleteProduct = async ({ id }) => {
    try {
        // 除了響應 Promise 外，這邊取出了許消請求的方法
        const [delPromise, abortDelete] = karman.delete({ id })
        // 滿足條件時，取消刪除商品請求
        if (await someReason()) abortDelete()
        const res = await delPromise
        console.log(res)
    } catch (error) {
        // 若請求被取消，程式控制權將轉移至 catch block
        console.error(error)
    }
};
```

## 核心

### Karman Tree

在[簡易示範](#簡易示範)中有提到，可以透過 `defineKarman()` 來建立一個抽象層、一個 Karman 實例、或稱「karman node」，事實上你還可以透過巢狀的方式去組織更複雜的「karman tree」，這使得我們可以根據 API 的路徑、所需配置不同，去做不同層次的管理。

#### Route Management

每個 `defineKarman()` 內都可以配置屬於該層的 url 路徑，路徑可以配置或不配置，可以是完整的 url 也可以是 url 的片段，但要注意的是，你為該層 karman node 所配置的 url 會[繼承](#inheritance)父節點的 url 配置，假設父節點的 url 是 `localhost:8000` 而子節點的 url 是 `users`，那麼子節點最後得到的基本 url 會是 `localhost:8000/users`。

```js
import { defineKarman } from "karman"

const rootKarman = defineKarman({
    root: true,
    // 此節點的 baseURL 是 "https://karman.com"
    url: "https://karman.com",
    route: {
        product: defineKarman({
            // 此節點的 baseURL 是 "https://karman.com/products"
            url: "products"
        }),
        user: defineKarman({
            // 此節點的 baseURL 是 "https://karman.com/users"
            url: "users"
        })
    }
})
```

若是要配置子節點，可以透過 `route` 屬性進行配置，`route` 會是一個物件，key 是該節點的名稱，value 是 karman node，而 karman node 會在初始化後被掛載至父節點上，可以通過你為該子節點所配置的路徑名稱存取該 karman node 上的方法或子節點。

```js
rootKarman.product.someAPI()
rootKarman.user.someNode.someAPI()
```

另外，在不多見的情況下，前端可能會使用到不同網域下的 API，也可以透過 `defineKarman()` 進行整合，讓整份專案都通過單一通道去和不同伺服器進行溝通。

```js
import { defineKarman } from "karman"

export default defineKarman({
    // 這層 url 為空
    root: true,
    route: {
        source01: defineKarman({
            // 這層管理 source01 底下的所有 API
            url: "https://source01.com"
        }),
        source02: defineKarman({
            // 這層管理 source02 底下的所有 API
            url: "https://source02.com"
        }),
    }
})
```

#### Inheritance

「繼承事件」會發生在當該層 karman node 的 `root` 被設置為 `true` 時觸發，事件被觸發時，會將根節點的配置繼承至子節點甚至孫節點上，直到該配置被子孫節點給複寫，而複寫後的配置也會有同樣的繼承行為。

```js
import { defineKarman } from "karman"

export default defineKarman({
    // ...
    root: true,
    // 配置 headers 以供繼承
    headers: {
        Accesstoken: localStorage.TOKEN
    },
    route: {
        route01: defineKarman({
            // 此節點會繼承 `{ Accesstoken: localStorage.TOKEN }` 作為 headers
        }),
        route02: defineKarman({
            // 此節點複寫了 headers
            headers: {
                // ...
            }
        }),
    }
})
```

karman tree 若是沒有配置根節點，會有以下的注意事項：

- 雖然 API 同樣可以發送，但該 API 所獲取的配置只會以該層 karman node 為參考，若是該節點的 `url` 與 API 配置的 `endpoint` 無法組成合法的 url，這可能會導致使用該 API 發送請求時出現錯誤。
- 無法使用根節點的專屬功能，如：設置排程任務執行間隔、為 karman tree 安裝依賴等。

> 排程管理器主要任務負責響應資料快取的檢查與清除，任務執行間隔可以透過 `scheduleInterval` 屬性進行設置，且只能透過根節點設置。

### Final API

「final API」是透過 `defineAPI()` 設置於 karman node 的 `api` 內的方法，且與 karman tree 同樣會有繼承與複寫的行為，final API 會在初始化時先記錄由 `defineAPI()` 給予的配置，並在運行時引用所屬 karman node 的配置後再以初始化時的配置進行複寫。

final API 同樣可以選擇配置 url 或 url 的片段，當今天某路由上可能只有零星幾個 API 時，可以考慮將他們配置到父節點上，而不用另外在建立新的節點，讓路由的配置可以更彈性。

```js
import { defineKarman, defineAPI } from "karman"

export default defineKarmna({
    root: true,
    url: "https://karman.com/products",
    api: {
        getAll: defineAPI(),
        // 此 final API 的 url 是 "https://karman.com/products/categories"
        getCategories: defineAPI({
            endpoint: "categories"
        })
    }
})
```

#### Request Strategy

`requestStrategy` 屬性可以決定該 final API 所選用的 HTTP Client，目前支援 `"xhr"` 與 `"fetch"` 作為參數，並以 `"xhr"` 作為預設選項。

```js
import { defineKarman, defineAPI } from "karman"

export default defineKarmna({
    root: true,
    url: "https://karman.com/products",
    api: {
        // 此方法將使用預設的 XMLHttpRequest 作為 HTTP Client
        getAll: defineAPI(),
        // 此方使用 fetch 作為 HTTP Client
        getCategories: defineAPI({
            endpoint: "categories",
            requestStrategy: "fetch",
        })
    }
})
```

> 不同的請求策略有不同的響應格式，在處理響應的資料上需要注意。

#### Parameter Definition

在定義該方法所需的參數時可以透過 `payloadDef` 屬性，key 是參數名稱，value 是該參數的相關定義，包括：該參數要用在哪裡、是否為必要參數、[參數的驗證規則](#validation-enigine)。

首先決定該參數要用在哪裡，可以透過以下三個屬性來決定：

- `path: number`：須為大於等於 0 的正整數，會將參數以路徑的方式銜接在該方法的 url 之後。
- `query: boolean`：為 `true` 時，會以 `參數名稱=接收值` 的格式串接 url 的查詢參數。
- `body: boolean`：為 `true` 時，會將參數用於請求體中，與 `query` 相同的是，key 都會採用 `payloadDef` 中所定義的名稱。

以上屬性可重複設置，代表同一參數可以用在請求中的不同地方。

接下來決定參數是否必須，可以透過 `required: boolean` 來設置，但要注意的是，驗證參數是否為必須，屬於驗證引擎的一環，但因設計上的考量沒有將 `required` 放在 `rules` 內，因此必須在該 final API 上的某個父節點或 API 配置本身將 `validation` 設置為 `true` 來啟動驗證機制。

最後在[參數驗證規則](#validation-enigine)的部分較為複雜，因此以獨立章節來解說。

```js
import { defineKarman, defineAPI } from "karman"

const karmanProduct = defineKarmna({
    root: true,
    url: "https://karman.com/products",
    validation: true,                   // 先啟動該節點的驗證引擎
    api: {
        getAll: defineAPI({
            payloadDef: {
                limit: { query: true }  // 非必要參數 limit 將用在查詢參數
            }
        }),
        getById: defineAPI({
            payloadDef: {
                id: {                   // 必要參數 id 將用於路徑中的首項
                    required: true,
                    path: 0
                },
                category: { path: 1 }   // 非必要參數 category 將用於路徑中的第二項
            }
        })
    }
})

karmanProduct.getALL()                  // url: https://karman.com/products
karmanProduct.getALL({ limit: 10 })     // url: https://karman.com/products?limit=10
karmanProduct.getById()                 // ValidationError
karmanProduct.getById({ id: 10 })       // url: https://karman.com/products/10
karmanProduct.getById({                 // url: https://karman.com/products/10/clothes
    id: 10,
    category: "clothes"
})
```

### Validation Enigine

驗證引擎包辦了 final API 的參數驗證機制，在 final API 發送請求時，會驗證接收參數是否符合參數定義的驗證規則，若是有參數未通過驗證，該次請求將不會建立，並拋出 `ValidationError`，其中錯誤訊息能由驗證引擎自動產生或由使用者自行定義。

#### Rules

驗證規則有很多種，從驗證引擎本身所提供的到客製化驗證函式，會有以下這些種類：

- **String Rule**

    由字串所描述的型別，為 JavaScript 的原始型別的擴展，在某些特殊型別會有其獨有的定義，此規則會由驗證引擎自動產生錯誤訊息。

    - `"char"`：字符，長度為 1 的字串
    - `"string"`：字串
    - `"int"`：整數
    - `"number"`：數字
    - `"nan"`：NaN
    - `"boolean"`：布林值
    - `"object"`：廣義物件，包含 `null`、`() => {}`、`{}`、或`[]`
    - `"null"`：null
    - `"function"`：函式
    - `"array"`：陣列
    - `"object-literal"`：以花括號所表示的物件
    - `"undefined"`：undefined
    - `"bigint"`：bigint
    - `"symbol"`：symbol

- **Contructor**

    任何建構函式（class），驗證引擎會以 `instanceof` 進行驗證。

- **Custom Validator**

    客製化驗證函式，但理論上 JavaScript 無法辨識普通函式與建構函式的差異，因此需要透過 `defineCustomValidator()` 來進行定義，否則會將該函式視為建構函式來處理。

- **Regular Expression**

    正則表達式，可以包含或不包含錯誤訊息。

- **Parameter Descriptor**

    參數描述符，以物件形式構成，可以定義參數的最大、最小、相等值、以及測量屬性，使用上最好與 String Rule 搭配，形成一個 [Rule Set](#rule-set)，先進行型別的驗證後再進行單位的測量，確保驗證機制的完整性。

```js
import { defineKarman, defineAPI, defineCustomValidator, ValidationError } from "karman"

const customValidator = defineCustomValidator((prop, value) => {
    if (value !== "karman")
        throw new ValidationError(`參數 '${prop}' 必為 'karman' 但卻接收到 '${value}'`)
})

const emailRule = { 
    regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "錯誤的 email 格式"
}

const karman = defineKarmna({
    // ...
    validation: true,
    api: {
        ruleTest: defineAPI({
            payloadDef: {
                param01: { rule: "char" },          // String Rule
                param02: { rule: Date },            // Constructor
                param03: { rule: customValidator }, // Custom Validator
                param04: { rule: emailRule },       // Regular Expression
                param05: {                          // Parameter Descriptor
                    rule: {
                        min: 0,
                        max: 5,
                        measurement: "length"
                    }
                },
            }
        }),
    }
})

karman.ruleTest()                                   // 沒有參數設置 required，因此不會拋出錯誤
karman.ruleTest({ param01: "A" })                   // Success
karman.ruleTest({ param01: "foo" })                 // ValidationError
karman.ruleTest({ param02: new Date() })            // Success
karman.ruleTest({ param02: "2024-01-01" })          // ValidationError
karman.ruleTest({ param03: "karman" })              // Success
karman.ruleTest({ param03: "bar" })                 // ValidationError: 參數 'param03' 必為 'karman' 但卻接收到 'bar'
karman.ruleTest({ param04: "karman@gmail.com" })    // Success
karman.ruleTest({ param04: "karman is the best" })  // ValidationError: 錯誤的 email 格式
karman.ruleTest({ param05: "karman" })              // Success
karman.ruleTest({ param05: "karman is the best" })  // ValidationError
karman.ruleTest({ param05: 1 })                     // 會以警告提示找不到可測量的屬性
```

#### Rule Set

規則的集合，為上一章節所說明的規則所排列構成，會由集合索引首位的規則開始依序驗證，而種類有交集規則（Intersection Rules）與聯集規則（Union Rules），分別會觸發不同的驗證機制。

- **Intersection Rules**

    可以透過 `defineIntersectionRules()` 或普通陣列來定義，驗證引擎在接收到普通陣列作為規則時，會將其隱式轉換成聯集規則，當使用此集合作為驗證規則時，參數須符合所有規則才算通過驗證。

- **Union Rules**

    透過 `defineUnionRules()` 定義，使用此集合作為驗證規則時，參數只須符合集合中的其中一項規則即代表通過驗證。

### Interceptors/Hooks

### Response Caching

### DTO of I/O

## API 文件

### defineKarman(option)

### Karman

### defineAPI(option)

### defineCustomValidator(validator)

### defineUnionRules(...rules)

### defineIntersectionRules(...rules)

### ValidationError

### isValidationError(error)