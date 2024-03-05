import RequestPipe, { PipeDetail } from "@/abstract/request-pipe.abstract";
import { ReqStrategyTypes, RequestExecutor } from "@/types/karman/http.type";
import { CacheStrategyTypes } from "@/types/karman/karman.type";
import MemoryCache from "./cache-strategy/memory-cache.provider";
import CacheStrategy from "@/abstract/cache-strategy.abstract";
import { isEqual } from "lodash";

export default class CachePipe implements RequestPipe {
  constructor(private readonly memoryCache: MemoryCache) {}

  public chain<D, T extends ReqStrategyTypes>(
    requestDetail: PipeDetail<D, T>,
    options: { cacheStrategyType?: CacheStrategyTypes; expiration?: number },
  ): RequestExecutor<D> {
    const { cacheStrategyType, expiration } = options;
    const cache = this.getCacheStrategy(cacheStrategyType ?? "memory");
    const { promiseExecutor, requestExecutor, requestKey, payload } = requestDetail;
    const cacheData = cache.get<D>(requestKey);
    const { resolve } = promiseExecutor;
    const currentT = Date.now();

    if (cacheData && cacheData.expiration < currentT) {
      const { res } = cacheData;
      const isSameRequest = isEqual(payload, cacheData.payload);

      if (isSameRequest) {
        resolve(res as D);

        return requestExecutor;
      }
    }

    const [reqPromise, abortControler] = requestExecutor();

    const newPromise = reqPromise.then((res) => {
      cache.set<D>(requestKey, { res, payload, expiration: expiration ?? currentT + 1000000 });

      return res;
    });

    return () => [newPromise, abortControler];
  }

  private getCacheStrategy(type: CacheStrategyTypes): CacheStrategy {
    if (type === "memory") return this.memoryCache;
    else throw new Error(`failed to use "${type}" cache strategy.`);
  }
}
