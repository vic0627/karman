
import { defineKarman, defineAPI } from "../../dist/karman"

export default defineKarman({                               // 創建 Karman 抽象層實例/節點
    root: true,                                             // 指定此層為根節點
    url: "https://karman.com",                              // 此節點的基本 url
    headers: {                                              // 配置共同 headers
        "Content-Type": "application/json; charset=utf-8",
    },
    onRequest(req) {                                        // 攔截器定義每次請求前行為
        const token = localStorage["TOKEN"]
        if (this._typeCheck.isString(token))                // 使用插件檢查 token 型別
            req.headers["Access-Token"] = token
    },
    onResponse(res) {                                       // 攔截器返回請求成功的狀態碼
        return res.status === 200
    },
    api: {
        login: defineAPI({
            url: "auth/login",                              // 無其他相關 API，不另建節點
            // ...
            onSuccess(res) {
                const { token } = res.data
                if (this._typeCheck.isString(token))
                    localStorage["TOKEN"] = token           // 請求成功，將 token 寫入 storage

                return !!token                              // 返回登入成功與否
            }
        })
    },
    route: {
        product: defineKarman({
            url: "products",                                // 根據上一層節點延伸的路徑片段
            api: {
                getAll: defineAPI(),
                addOne: defineAPI({
                    method: "POST",
                    // ...
                }),
                updateOne: defineAPI({
                    url: ":id",                             // 根據此節點延伸的路徑片段
                    method: "PUT",
                    // ...
                }),
                delOne: defineAPI({
                    url: ":id",
                    method: "DELETE",
                    // ...
                }),
                getCategories: defineAPI({
                    url: "categories",
                    // ...
                })
            }
        }),
        cart: defineKarman({
            url: "carts",
            api: {
                getAll: defineAPI(),
                addNew: defineAPI({
                    method: "POST",
                    // ...
                }),
                modifyOne: defineAPI({
                    url: ":id",
                    method: "PATCH",
                    // ...
                }),
                delOne: defineAPI({
                    url: ":id",
                    method: "DELETE",
                    // ...
                })
            }
        })
    }
})