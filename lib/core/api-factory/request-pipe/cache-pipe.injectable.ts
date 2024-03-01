import RequestPipe, { PipeDetail } from "@/abstract/request-pipe.abstract";
import { RequestExecutor } from "@/types/karman/http.type";
import { CacheStrategyTypes } from "@/types/karman/karman.type";
import MemoryCache from "./cache-strategy/memory-cache.provider";
import CacheStrategy from "@/abstract/cache-strategy.abstract";
import { isEqual } from "lodash";

export default class CachePipe implements RequestPipe {
  constructor(private readonly memoryCache: MemoryCache) {}

  public chain<D>(requestDetail: PipeDetail<D>, cacheStrategyType: CacheStrategyTypes): RequestExecutor<D> {
    const cache = this.getCacheStrategy(cacheStrategyType);
    const { promiseExecutor, requestExecutor, requestKey, config, payload } = requestDetail;
    const cacheData = cache.get<D>(requestKey);
    const { resolve } = promiseExecutor;

    if (cacheData) {
      const { res } = cacheData;
      const isSameRequest = isEqual(payload, cacheData.payload);

      if (isSameRequest) {
        resolve(res as D);

        return requestExecutor;
      }
    }

    const [reqPromise, abortControler] = requestExecutor();

    const newPromise = reqPromise.then();

    return () => [newPromise, abortControler];
  }

  private getCacheStrategy(type: CacheStrategyTypes): CacheStrategy {
    if (type === "memory") return this.memoryCache;
    else throw new Error(`failed to use "${type}" cache strategy.`);
  }
}
