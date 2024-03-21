import RequestPipe, { PipeDetail } from "@/abstract/request-pipe.abstract";
import { ReqStrategyTypes, RequestExecutor } from "@/types/http.type";
import { CacheStrategyTypes } from "@/types/karman.type";
import MemoryCache from "./cache-strategy/memory-cache.provider";
import CacheStrategy, { CacheData } from "@/abstract/cache-strategy.abstract";
import { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";
import ScheduledTask from "@/core/scheduled-task/scheduled-task.injectable";
import Injectable from "@/decorator/Injectable.decorator";
import { isEqual } from "lodash-es";
import LocalStorageCache from "./cache-strategy/local-storage-cache.provider";
import SessionStorageCache from "./cache-strategy/session-storage-cache.provider";

@Injectable()
export default class CachePipe implements RequestPipe {
  constructor(
    private readonly scheduledTask: ScheduledTask,
    private readonly memoryCache: MemoryCache,
    private readonly localStorageCache: LocalStorageCache,
    private readonly sessionStorageCache: SessionStorageCache,
  ) {}

  public chain<D, T extends ReqStrategyTypes>(
    requestDetail: PipeDetail<D, T>,
    options: { cacheStrategyType?: CacheStrategyTypes; expiration?: number },
  ): RequestExecutor<SelectRequestStrategy<T, D>> {
    const { cacheStrategyType, expiration } = options;
    const cache = this.getCacheStrategy(cacheStrategyType ?? "memory");
    const { promiseExecutor, requestExecutor, requestKey, payload } = requestDetail;
    const cacheData = cache.get(requestKey);
    const currentT = Date.now();

    if (cacheData && cacheData.expiration > currentT) {
      const { res } = cacheData;
      const isSameRequest = isEqual(payload, cacheData.payload);

      if (isSameRequest) {
        const [reqPromise, abortControler] = requestExecutor(false);
        const reqExecutor: RequestExecutor<SelectRequestStrategy<T, D>> = () => [reqPromise, abortControler];
        promiseExecutor.resolve(res as SelectRequestStrategy<T, D>);

        return reqExecutor;
      }
    }

    const [reqPromise, abortControler] = requestExecutor(true);

    const newPromise = reqPromise.then(
      this.promiseCallbackFactory(requestKey, cache, {
        payload,
        expiration: (expiration ?? 1000 * 60 * 10) + currentT,
      }),
    );

    return () => [newPromise, abortControler];
  }

  private getCacheStrategy(type: CacheStrategyTypes): CacheStrategy {
    if (type === "memory") return this.memoryCache;
    else if (type === "localStorage") return this.localStorageCache;
    else if (type === "sessionStorage") return this.sessionStorageCache;
    else throw new Error(`failed to use "${type}" cache strategy.`);
  }

  private promiseCallbackFactory<T extends ReqStrategyTypes, D>(
    requestKey: string,
    cache: CacheStrategy,
    cacheData: Omit<CacheData<T, D>, "res">,
  ) {
    return (res: SelectRequestStrategy<T, D>) => {
      const data = { ...cacheData, res };
      this.scheduledTask.addSingletonTask(cache.name, (now) => cache.scheduledTask(now));
      cache.set(requestKey, data);

      return res;
    };
  }
}
