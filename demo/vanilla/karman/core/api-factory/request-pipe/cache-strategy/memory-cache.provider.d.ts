import CacheStrategy, { CacheData } from "@/abstract/cache-strategy.abstract";
import { ReqStrategyTypes } from "@/types/karman/http.type";
export default class MemoryCache implements CacheStrategy {
    private readonly store;
    set<T extends ReqStrategyTypes, D>(requestKey: string, cacheData: CacheData<T, D>): void;
    delete(requestKey: string): void;
    has(requestKey: string): boolean;
    get<T extends ReqStrategyTypes, D>(requestKey: string): CacheData<T, D> | undefined;
    clear(): void;
    scheduledTask(now: number): boolean;
    private checkExpiration;
}
//# sourceMappingURL=memory-cache.provider.d.ts.map