# Middleware

中間件（Middleware）是指在 FinalAPI 執行時的某個生命週期中執行的函式，主要分為兩類：

- **Interceptors**：於 karman node 上配置，主要攔截該節點以下的所有 FinalAPI 的請求（req）與響應（res）物件，可以實現存取物件屬性並有條件地執行副作用等功能，只能以同步任務定義。
- **Hooks**：於定義 API 或調用 FinalAPI 時配置，被定義的 hooks 只適用於該 FinalAPI，某些 hooks 可以以非同步任務定義，或具備返回值，可透過返回值來改變某些行為或參數。

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

const hooksKarman = defineKarman({
  // ...
  validation: true,
  // Interceptors
  /**
   * 攔截請求物件，包括請求的 url、method、headers 等其他請求配置
   * @param req - 請求物件
   */
  onRequest(req) {
    console.log("onRequest");
    req.headers["Access-Token"] = localStorage["TOKEN"];
  },
  /**
   * 攔截響應物件，依照每個 FinalAPI 選用的請求策略不同，可能會有不同規格，在物件屬性的存取上需稍加注意
   * @param res - 響應物件
   * @returns {boolean | undefined} 可自行判斷合法狀態碼，並返回布林值，預設是大於等於 200、小於 300 的區間
   */
  onResponse(res) {
    console.log("onResponse");
    const { status } = res;

    return status >= 200 && status < 300;
  },
  api: {
    hookTest: defineAPI({
      // ...
      // Hooks
      /**
       * 於驗證前調用，但若 `validation === false` 則會被忽略
       * 通常可以用來動態改變驗證規則、給予參數預設值、手動對較複雜的參數類型進行驗證等
       * @param payloadDef - 參數定義物件
       * @param payload - FinalAPI 實際接收參數
       */
      onBeforeValidate(payloadDef, payload) {
        console.log("onBeforeValidate");
      },
      /**
       * 會在建構最終的請求 url 及請求體前執行，可以用來給予參數預設值或對 payload 物件進行其他資料處理的動作
       * @param payload - FinalAPI 實際接收參數
       * @returns {Record<string, any> | undefined} 若返回值為物件，將做為新的 payload 來建構 url 與請求體
       */
      onRebuildPayload(payload) {
        console.log("onRebuildPayload");
      },
      /**
       * 於建立請求前呼叫，可以用來建立請求體，像是建立 FormData 等動作
       * @param url - 請求 url
       * @param payload - FinalAPI 實際接收參數
       * @returns {Document | BodyInit | null | undefined} 若有返回值，將作為最後送出請求時的 request body
       */
      onBeforeRequest(url, payload) {
        console.log("onBeforeRequest");
      },
      /**
       * 請求成功時呼叫，可配置非同步任務，通常用於接收到響應結果後初步的資料處理
       * @param res - 響應物件
       * @returns {Promise<any> | undefined} 若有返回值，將作為 FinalAPI 的返回值
       */
      async onSuccess(res) {
        console.log("onSuccess");

        return "get response";
      },
      /**
       * 請求失敗時呼叫，可配置非同步任務，通常用於錯誤處理
       * @param err - 錯誤物件
       * @returns {Promise<any> | undefined} 若有返回值，FinalAPI 就不會拋出錯誤，並將 onError 的返回值作為 FinalAPI 發生錯誤時的返回值
       */
      async onError(err) {
        console.log("onError");

        return "response from error";
      },
      /**
       * FinalAPI 最後一定會執行的 hooks，可配置非同步任務，通常用於呼叫副作用
       */
      async onFinally() {
        console.log("onFinally");
      },
    }),
  },
});
```

> [!WARNING]
> Middleware 在配置時盡量以一般函式宣告，避免使用箭頭函式，這是因為如果在 Middleware 內透過 `this` 存取 karman node，箭頭函式將會使該函式失去 `this` 的指向。

嘗試執行：

```js
hooksKarman.hookTest()[0].then((res) => console.log(res));
```

請求成功時主控台輸出：

```txt
onBeforeValidate
onRebuildPayload
onBeforeRequest
onRequest
onResponse
onSuccess
onFinally
get response
```

請求失敗時主控台輸出：

```txt
onBeforeValidate
onRebuildPayload
onBeforeRequest
onRequest
onResponse
onError
onFinally
response from error
```

在 FinalAPI 複寫部分 hooks 後嘗試執行：

```js
hooksKarman
  .hookTest(null, {
    onSuccess() {
      return "overwrite onSuccess";
    },
    onError() {},
  })[0]
  .then((res) => console.log(res));
```

請求成功時主控台輸出：

```txt
onBeforeValidate
onRebuildPayload
onBeforeRequest
onRequest
onResponse
onFinally
overwrite onSuccess
```

請求失敗時主控台輸出：

```txt
onBeforeValidate
onRebuildPayload
onBeforeRequest
onRequest
onResponse
onError
onFinally
Uncaught Error: ...
```

> [!WARNING]
> 若是觸發主動設置的 timeout 或調用 abort 方法，onResponse 將不被執行。
