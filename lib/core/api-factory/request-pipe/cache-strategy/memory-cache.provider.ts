import CacheStrategy, { CacheData } from "@/abstract/cache-strategy.abstract";

export default class MemoryCache implements CacheStrategy {
  private readonly store: Map<string, CacheData<any>> = new Map();

  set<D>(requestKey: string, cacheData: CacheData<D>): void {
    this.store.set(requestKey, cacheData);
  }

  delete(requestKey: string): void {
    this.store.delete(requestKey);
  }

  has(requestKey: string): boolean {
    return this.store.has(requestKey);
  }

  get<D>(requestKey: string): CacheData<D> | undefined {
    const data = this.store.get(requestKey);
    const existed = this.checkExpiration<D>(requestKey, data);

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

  private checkExpiration<D>(requestKey: string, cacheData?: CacheData<D>): cacheData is CacheData<D> {
    if (!cacheData) return false;

    if (Date.now() > cacheData.expiration) {
      return !this.store.delete(requestKey);
    }

    return true;
  }
}
