# 卡門樹

在[簡易示範](./README.md)中有提到，可以透過 `defineKarman()` 來建立一個抽象層節點、一個 Karman 實例、或稱「karman node」，事實上你還可以透過巢狀的方式去組織更複雜的「karman tree」，這使得我們可以根據 API 的路徑、所需配置不同，去做不同層次的管理。

- [卡門樹](#卡門樹)
  - [路由管理](#路由管理)
  - [繼承事件](#繼承事件)
  - [外掛](#外掛)

## 路由管理

每個 `defineKarman()` 內都可以配置屬於該層的 url 路徑，路徑可以配置或不配置，可以是完整的 url 也可以是 url 的片段，但要注意，你為 karman node 所配置的 url 會參考父節點的 url 組合成一組該節點的基本 url。

```js
import { defineKarman } from "@vic0627/karman";

const rootKarman = defineKarman({
  root: true,
  // 此節點的 baseURL 是 "https://karman.com"
  url: "https://karman.com",
  route: {
    product: defineKarman({
      // 此節點的 baseURL 是 "https://karman.com/products"
      url: "products",
    }),
    user: defineKarman({
      // 此節點的 baseURL 是 "https://karman.com/users"
      url: "users",
    }),
  },
});
```

若是要配置子節點，可以透過 `route` 屬性進行配置，`route` 會是一個物件，key 是該節點的名稱，value 是 karman node，而 karman node 會在初始化後被掛載至父節點上，可以通過你為該子節點所配置的路徑名稱存取該 karman node 上的 `FinalAPI` 或孫節點。

```js
rootKarman.product.someAPI();
rootKarman.user.someNode.someAPI();
```

另外，在不多見的情況下，前端可能會使用到不同網域下的 API，也可以透過 `defineKarman()` 進行整合，讓整份專案都通過單一窗口去和不同伺服器進行溝通。

```js
import { defineKarman } from "@vic0627/karman";

export default defineKarman({
  // 這層 url 為空
  root: true,
  route: {
    source01: defineKarman({
      // 這層管理 source01 底下的所有 API
      url: "https://source01.com",
    }),
    source02: defineKarman({
      // 這層管理 source02 底下的所有 API
      url: "https://source02.com",
    }),
  },
});
```

## 繼承事件

「繼承事件」會發生在當該層 karman node 的 `root` 被設置為 `true` 時觸發，事件被觸發時，會將根節點的配置繼承至子節點甚至孫節點上，直到該配置被子孫節點複寫，而複寫後的配置也會有相同的繼承行為。

```js
import { defineKarman } from "@vic0627/karman";

export default defineKarman({
  // ...
  root: true,
  // 配置 headers 以供繼承
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  route: {
    route01: defineKarman({
      // 此節點會繼承上一層節點的 headers 配置
    }),
    route02: defineKarman({
      // 此節點複寫了 headers
      headers: {
        // ...
      },
    }),
  },
});
```

> [!CAUTION]
>
> > `headers` 請配置靜態的屬性，若要將動態資訊寫入 `headers`，請利用[攔截器](#middleware)。

karman tree 若是沒有配置根節點，會有以下的注意事項：

- 雖然 API 同樣可以發送，但該 API 所獲取的配置只會以該層 karman node 為參考，若是該節點的 `url` 與 API 配置的 `url` 無法組成有效的 url，這可能會導致發送請求時出現錯誤。
- 無法使用根節點的專屬功能，如：設置排程任務執行間隔。

> [!NOTE]
> 排程管理器主要任務負責響應資料快取的檢查與清除，任務執行間隔可以透過 `scheduleInterval` 屬性進行設置，且只能透過根節點設置。

卡門樹只能有一個根節點，且必須是頂層的節點，否則 Karman 將拋出錯誤。

## 外掛

在 [Middleware](./middleware.md) 中會介紹到 Interceptors 與 Hooks 的配置，這類型的配置都可以在函式內透過 `this` 來獲取 karman node 上的屬性或方法，假設有在 Middleware 中常用的常數、方法等，可以考慮將其安裝到 karman node 上。

依賴的安裝需要透過 karman node 來執行（v1.3.0 前還是要用根節點安裝），使用 `Karman.$use()` 的方法進行安裝，而依賴本身必須為物件，並且物件上需有 `install()` 方法。

除此之外，Karman 本身也有提供內建的依賴可以使用：

- `Karman._typeCheck`：[驗證引擎](./validation-enigine.md) String Rule 所使用的型別驗證器。
- `Karman._pathResolver`：karman 在進行 url 組成時所使用的模組，類似於 node.js 的 `path` 模組。

```js
import { defineKarman } from "@vic0627/karman";

// hooks 中的常用方法
const add = (a, b) => a + b;
// 先為 add 定義 install 方法
Object.defineProperty(add, "install", {
  value: (Karman) => {
    // 接著定義 install 方法的實現
    Karman.prototype._add = add;
  },
});

const karman = defineKarman({
  root: true,
  onRequest() {
    const isString = this._typeCheck.isString(""); // 內建依賴
    const paths = this._pathResolver.trim("//foo/bar///"); // 內建依賴
    const sum = this._add(2, 3); // 自行安裝的依賴
    console.log(isString, paths, sum);
  },
  // ...
});

karman.$use(_add); // 使用 root karman node 安裝依賴

karman.someAPI(); // console output: true "foo/bar" 5
```

**補充：讓外掛支援語法提示**

若想要讓安裝的依賴也能夠支援語法提示功能，可以使用 `.d.ts` 聲明文件，首先將依賴寫在另一份 `.js` 中：

```js
// /src/karman/constant.js
const _constant = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  install(karman) {
    Karman.prototype._constant = this;
  },
};
export default _constant;
```

在同一個目錄下，新增一份名稱相同的 `.d.ts` 聲明文件：

```ts
// /src/karman/constant.d.ts
interface Constant {
  second: number;
  minute: number;
  hour: number;
}
declare const _constant: Constant;
export default _constant;

// ⚠️ 模組擴展的聲明一定要記得撰寫，將依賴聲明在 KarmanDependencies 之中
declare module "@vic0627/karman" {
  interface KarmanDependencies {
    /**
     * 也可以用 block comment 為依賴撰寫註解文件
     */
    _constant: Constant;
  }
}
```

最後，在 root karman 的文件中引入依賴，後續在 Middleware 中使用依賴時，就能支援完整的語法提示：

```js
// /src/karman/index.js
import { defineKarman } from "@vic0627/karman";
import constant from "./constant";

const rootKarman = defineKarman({
  // ...
  onRequest() {
    this._constant; // <= hover 顯示型別、註解
  },
});

rootKarman.$use(constant);
```
