import RequestPipe, { PipeDetail } from "@/abstract/request-pipe.abstract";
import { ReqStrategyTypes, RequestExecutor } from "@/types/karman/http.type";
import { CacheStrategyTypes } from "@/types/karman/karman.type";
import MemoryCache from "./cache-strategy/memory-cache.provider";
import { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";
import ScheduledTask from "@/core/scheduled-task/scheduled-task.injectable";
export default class CachePipe implements RequestPipe {
    private readonly scheduledTask;
    private readonly memoryCache;
    constructor(scheduledTask: ScheduledTask, memoryCache: MemoryCache);
    chain<D, T extends ReqStrategyTypes>(requestDetail: PipeDetail<D, T>, options: {
        cacheStrategyType?: CacheStrategyTypes;
        expiration?: number;
    }): RequestExecutor<SelectRequestStrategy<T, D>>;
    private getCacheStrategy;
    private promiseCallbackFactory;
}
//# sourceMappingURL=cache-pipe.injectable.d.ts.map