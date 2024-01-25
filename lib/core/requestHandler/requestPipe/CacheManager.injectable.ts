import type {
  HttpResponse,
  PromiseExecutor,
  RequestDetail,
  RequestExecutor,
  RequestExecutorResult,
} from "src/types/xhr.type";
import type { Payload } from "src/types/ruleObject.type";
import RequestPipe from "src/abstract/RequestPipe.abstract";
import { notNull } from "src/utils/common";
import Injectable from "src/decorator/Injectable.decorator";
import WebStorage from "./cacheStrategy/WebStorage.provider";
import CacheStrategy from "src/abstract/CacheStrategy.abstract";
import ScheduledTask from "src/core/scheduledTask/ScheduledTask.provider";

/**
 * (pipe) 快取管理
 */
@Injectable()
export default class CacheManager implements RequestPipe {
  /** 快取抽象策略，依前後端環境使用不同快取策略。 */
  #heap?: CacheStrategy;

  #initStrategy() {
    if (window?.sessionStorage) {
      this.#heap = this.webStorage;
    }

    if (!this.#heap) {
      throw new Error("no cache strategy is used");
    }
  }

  constructor(
    private readonly webStorage: WebStorage,
    private readonly scheduleTask: ScheduledTask,
  ) {
    this.#initStrategy();
  }

  chain({ requestToken, request, executor }: RequestDetail, payload: Payload, cacheLifetime: number = 1000 * 60 * 5) {
    return ((onRequest) => {
      // 如果當前被呼叫的 API 存在暫存結果，就比較前後參數
      // 如果前後兩次參數相同，就返回暫存數據，直到參數不同

      /** 暫存結果 */
      const cache = this.#cache({ requestToken, payload, executor, cacheLifetime });

      if (cache) {
        return cache as RequestExecutorResult;
      }

      const [response, abort] = request(onRequest);

      // 利用 Promise chaining 實現 middeware
      const promise = (response as Promise<HttpResponse>).then((res) =>
        this.#chainingCallback({ requestToken, res, executor, payload, cacheLifetime }),
      );

      return [promise, abort];
    }) as RequestExecutor;
  }

  /** 比較 payload 參數並取得暫存結果 */
  #cache(options: { requestToken: symbol; payload: Payload; executor: PromiseExecutor; cacheLifetime: number }) {
    const { requestToken, payload, executor } = options;
    // 1. 檢查是否要進快取

    // 1-1. 無快取紀錄時返回
    if (!this.#heap?.has(requestToken)) {
      return;
    }

    const cache = this.#heap.get(requestToken);

    // 1-2. 快取過期時返回
    if (Date.now() > cache.expiration) {
      return;
    }

    // 2. 前後兩次參數相同時，返回快取結果
    if (this.#samePayload(payload, cache?.payload)) {
      // xhr 已建立，但沒 send，此時的 resolve 只是 xhr 的清除函式
      // 一但偵測到快取，就不會有 Promise，這裡一定要清除 xhr！
      executor.resolve(cache.res as HttpResponse);

      const abort = () => {
        console.warn("failed to abort request from cache manager");
      };

      const cacheRes = new Promise<HttpResponse | void>((resolve) => resolve(cache.res as HttpResponse));

      return [cacheRes, abort];
    }
  }

  /** 寫入/更新快取並返回請求結果 */
  #chainingCallback(options: {
    requestToken: symbol;
    payload: Payload;
    res: HttpResponse | void;
    executor: PromiseExecutor;
    cacheLifetime: number;
  }) {
    const { requestToken, payload, res, cacheLifetime } = options;

    if (notNull(res) && this.#heap) {
      this.#heap?.set(requestToken, { res, payload, expiration: Date.now() + cacheLifetime });

      this.scheduleTask.addSingletonTask("cache", this.#heap?.scheduledTask.bind(this.#heap));
    } else {
      console.warn("cache failed in unexpected circumstance");
    }

    return res as HttpResponse;
  }

  /** 比較兩物件(payload)是否相同 */
  #samePayload<T extends Payload>(obj1: T, obj2: T) {
    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    if (typeof obj1 === "object") {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        if (!this.#samePayload(obj1[key] as T, obj2[key] as T)) {
          return false;
        }
      }

      return true;
    }

    return obj1 === obj2;
  }
}
