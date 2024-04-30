# Response Caching

Settings related to caching functionality can be configured on `defineKarman`, `defineAPI`, and final API `config`. Setting `cache` to `true` enables caching, while `cacheExpireTime` determines the duration of cached data. The storage policy includes `memory`, `localStorage`, and `sessionStorage`, configured using the `cacheStrategy` attribute.

> [!CAUTION]
> When using WebStorage as the caching strategy, please note that WebStorage can only store values convertible to strings. Therefore, if caching is required for response results that cannot be represented as strings, consider using the `memory` strategy.

When the caching functionality of a final API is enabled, it records the request parameters and response results upon the first request. From the second request onwards, if the request parameters are the same as the previous one, it returns the cached data directly until the request parameters change or the cache expires, triggering a new request.

> [!WARNING]
> Final APIs that return cached data cannot use the abort method to cancel requests!

```js
import { defineKarman, defineAPI } from "@vic0627/karman"

const min = 1000 * 60

const cacheKarman = defineKarman({
    root: true,
    scheduleInterval: min * 30,                 // Root node can set schedule task execution interval
    // ...
    cache: true,                                // Enable caching globally
    cacheExpireTime: min * 5,                   // Set cache lifetime globally
    api: {
        getA: defineAPI(),                      // Default to using the memory strategy
        getB: defineAPI({
            cacheStrategy: 'localStorage'       // Use the localStorage strategy
        }),
    }
})

const cacheTesting = async () => {
    const res01 = await cacheKarman.getA()[0]   // First request, record request parameters and response results
    console.log(res01)           
    const res02 = await cacheKarman.getA()[0]   // Second request, parameters unchanged, return cached data directly
    console.log(res02)
}

cacheTesting()
```