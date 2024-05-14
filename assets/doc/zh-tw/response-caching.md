# Response Caching

快取功能的相關設定可以在 `defineKarman`、`defineAPI`、`FinalAPI` 上配置，設置 `cache` 為 `true` 可以快取響應資料， `cacheExpireTime` 能夠決定快取資料的存在時間，而儲存策略有 `memory`、`localStorage`、`sessionStorage`，並以 `cacheStrategy` 屬性來配置。

> [!CAUTION]
> 使用 WebStorage 作為快取策略時，請注意 WebStorage 僅能存儲**能轉換為字串**的值，因此若需快取無法以字串表示的響應結果時，請考慮使用 `memory` 策略。

當一支 FinalAPI 的快取功能被開啟後，會在首次請求時紀錄請求參數與響應結果，第二次請求開始，若請求參數與前次相同，將直接返回快取資料，直到請求參數改變或快取到期才會再次發送請求。

> [!WARNING]
> 返回快取資料的 FinalAPI 無法使用 abort 方法來取消請求！

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

const min = 1000 * 60;

const cacheKarman = defineKarman({
  root: true,
  scheduleInterval: min * 30, // 根節點可設置排程任務執行間隔
  // ...
  cache: true, // 批次啟用快取
  cacheExpireTime: min * 5, // 批次設定快取壽命
  api: {
    getA: defineAPI(), // 預設使用 memory 策略
    getB: defineAPI({
      cacheStrategy: "localStorage", // 選用 localStorage 策略
    }),
  },
});

const cacheTesting = async () => {
  const res01 = await cacheKarman.getA()[0]; // 首次請求，紀錄請求參數與響應結果
  console.log(res01);
  const res02 = await cacheKarman.getA()[0]; // 第二次請求，參數無變動，直接返回快取
  console.log(res02);
};

cacheTesting();
```
