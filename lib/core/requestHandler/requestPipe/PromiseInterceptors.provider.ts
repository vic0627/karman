import type { HttpResponse, RequestDetail, RequestExecutor } from "src/types/xhr.type";
import type { PromiseStageHooks } from "src/types/userService.type";
import RequestError from "../RequestError";
import RequestPipe from "src/abstract/RequestPipe.abstract";
import { deepClone } from "src/utils/common";

/**
 * (pipe) Promise 階段的攔截器
 */
export default class PromiseInterceptors implements RequestPipe {
  chain({ request }: RequestDetail, promiseInterceptor: PromiseStageHooks = {}): RequestExecutor {
    const { onRequest, onRequestFailed, onRequestSucceed } = promiseInterceptor;

    // RequestExecutor 不再帶參數，將 onRequest 鎖定在這個 pipe 實現
    // 後續再傳任和東西進 RequestExecutor 都不會產生效果
    return (() => {
      const [response, abort] = request(onRequest);

      const promise = (response as Promise<HttpResponse>)
        .then((res) => {
          if (typeof onRequestSucceed === "function") {
            // 避免 client 直接從物件地址修改(in-place)，導致快取暫存到修改後的結果
            // ，因此一定要過一次深拷貝。
            const resCopy = deepClone(res);

            const resClient = onRequestSucceed(resCopy);

            return resClient ?? resCopy;
          }

          return res;
        })
        .catch((error) => {
          if (typeof onRequestFailed === "function") {
            onRequestFailed(error as RequestError);
          } else {
            throw error as RequestError;
          }
        });

      return [promise, abort];
    }) as RequestExecutor;
  }
}
