import CacheStrategy, { CacheData } from "@/abstract/cache-strategy.abstract";
import { ReqStrategyTypes } from "@/types/http.type";

export default class SessionStorageCache implements CacheStrategy {
  public readonly name = "sessionStorage";
  private readonly keyStore: Set<string> = new Set();

  set<T extends ReqStrategyTypes, D>(requestKey: string, cacheData: CacheData<T, D>): void {
    this.keyStore.add(requestKey);
    sessionStorage.setItem(requestKey, JSON.stringify(cacheData));
  }

  delete(requestKey: string): void {
    this.keyStore.delete(requestKey);
    sessionStorage.removeItem(requestKey);
  }

  has(requestKey: string): boolean {
    return this.keyStore.has(requestKey);
  }

  get<T extends ReqStrategyTypes, D>(requestKey: string): CacheData<T, D> | undefined {
    let data: string | null | CacheData<T, D> = sessionStorage.getItem(requestKey);

    if (!data) return;

    data = JSON.parse(data) as CacheData<T, D>;
    const existed = this.checkExpiration(requestKey, data);

    if (existed) return data;
  }

  clear(): void {
    this.keyStore.forEach((key) => {
      sessionStorage.removeItem(key);
    });
    this.keyStore.clear();
  }

  scheduledTask(now: number): boolean {
    this.keyStore.forEach((key) => {
      const data = this.get(key);

      if (!data) {
        this.keyStore.delete(key);

        return;
      }

      if (now > data.expiration) {
        this.delete(key);
        this.keyStore.delete(key);
      }
    });

    return !this.keyStore.size;
  }

  private checkExpiration<T extends ReqStrategyTypes, D>(
    requestKey: string,
    cacheData?: CacheData<T, D>,
  ): cacheData is CacheData<T, D> {
    if (!cacheData) return false;

    if (Date.now() > cacheData.expiration) {
      this.delete(requestKey);

      return false;
    }

    return true;
  }
}
