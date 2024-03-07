import CacheStrategy, { CacheData } from "@/abstract/cache-strategy.abstract";
import { ReqStrategyTypes } from "@/types/karman/http.type";

export default class MemoryCache implements CacheStrategy {
  private readonly store: Map<string, any> = new Map();

  set<T extends ReqStrategyTypes, D>(requestKey: string, cacheData: CacheData<T, D>): void {
    this.store.set(requestKey, cacheData);
  }

  delete(requestKey: string): void {
    this.store.delete(requestKey);
  }

  has(requestKey: string): boolean {
    return this.store.has(requestKey);
  }

  get<T extends ReqStrategyTypes, D>(requestKey: string): CacheData<T, D> | undefined {
    const data = this.store.get(requestKey) as CacheData<T, D>;
    const existed = this.checkExpiration(requestKey, data);

    if (existed) return data;
  }

  clear(): void {
    this.store.clear();
  }

  scheduledTask(now: number): boolean {
    this.store.forEach((cache, key, map) => {
      if (now > cache.expiration) map.delete(key);
    });

    return !this.store.size;
  }

  private checkExpiration<T extends ReqStrategyTypes, D>(
    requestKey: string,
    cacheData?: CacheData<T, D>,
  ): cacheData is CacheData<T, D> {
    if (!cacheData) return false;

    if (Date.now() > cacheData.expiration) {
      return !this.store.delete(requestKey);
    }

    return true;
  }
}
